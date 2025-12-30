import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

export interface UserData {
  name: string;
  phone: string;
  email?: string;
}
interface PartyList {
  PartyId: number;
  // title: string;
  // image: string;
  PartyName: string;
  Address1:string;
  Address2:string;
  // active:boolean;
}

export interface GrowthData {
  monthlyGrowth: string;
  quarterlyGrowth: string;
}

export interface UserStats {
  totalOrders: number | string;
  totalSpent: number | string;
  savedAmount: number | string;
  points: number | string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileImage: string | ArrayBuffer | null = null;
  apiUrl: string = '';
  notification = {
    show: false,
    message: '',
    type: 'success' // 'success' or 'error'
  };
  isPopupOpen = false;
  partyList: any;
  userData: any = {};
  partylistdata: any[] = [];

  growthlistdata: any[] = [];
  profileForm!: FormGroup;

  growthData: GrowthData = {
    monthlyGrowth: "0",
    quarterlyGrowth: "0"
  };
  isOpen = false;

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }


  constructor(private router: Router,private authService: ApiService,private fb: FormBuilder) { }

  ngOnInit(): void {
    this.apiUrl = this.authService.getApiUrl();
    this.loadUserData();


  }

  private showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    this.notification = {
      show: true,
      message,
      type
    };
    setTimeout(() => {
      this.notification.show = false;
    }, 3000);
  }

  loadUserData(): void {
    debugger;
    const savedData = sessionStorage.getItem('userData');
    if (savedData) {
      this.userData = JSON.parse(savedData);
      this.profileForm = this.fb.group({
        name: [{ value: this.userData.ContactName || '', disabled: true }],
        email: [this.userData.Email || '', [Validators.required, Validators.email]],
        phone: [this.userData.Phone || '', [Validators.required,Validators.pattern(/^\d{10}$/)]],
        bankaccountname: [{ value: this.userData.BankName || '', disabled: true }],
        bankaccountno: [{ value: this.userData.BankAccountNo || '', disabled: true }],
        ifsccode: [{ value: this.userData.IfscCode || '', disabled: true }],
        upiid: [{ value: this.userData.UPIId || '', disabled: true }],
        designation: [{ value: this.userData.Designation || '', disabled: true }],
        department: [{ value: this.userData.Department || '', disabled: true }],
        add1:[{ value: this.userData.AddressLine1 || '', disabled: false }],
        add2:[{ value: this.userData.AddressLine2 || '', disabled: false }],
      });
    }
    const savedImage = `${this.apiUrl}/images/viewImage/Contact_${this.userData.ContactId}.PNG`;
    if (savedImage) {
      this.profileImage = savedImage;
    }
    this.getrestaurantdata(this.userData.ContactId);
    this.getgrowthpercentdata(this.userData.ContactId);
  }
  getrestaurantdata(ContactId:string ): void {

    this.authService.getrestrauntdata(ContactId).subscribe(
      (response) => {
        console.log('Restaurants:', response);
        this.partylistdata= response;
        this.partyList=[];
        for (let i = 0; i < this.partylistdata.length; i++) {
          const chunk :PartyList={
            PartyId: this.partylistdata[i].PartyId,
            PartyName: this.partylistdata[i].PartyName,
            Address1: this.partylistdata[i].PerAdd1,
            Address2: this.partylistdata[i].PerAdd2
          }
          this.partyList.push(chunk);
        }
        console.log(this.partyList);
      },
      (error) => {
        console.error('Error fetching points data:', error);
      }
    );
  }
  getgrowthpercentdata(ContactId:string ): void {

    this.authService.getgrowthpercent(ContactId).subscribe(
      (response) => {
        console.log('Restaurants:', response);
        this.growthlistdata= response;
        this.growthData.monthlyGrowth=Number(response[0].Last1stMonthGrowth).toFixed(2);
        this.growthData.quarterlyGrowth=Number(response[0].AvgGrowthPercent).toFixed(2);
        console.log(this.growthlistdata);
      },
      (error) => {
        console.error('Error fetching points data:', error);
      }
    );
  }

handleImgError(event: any) {
  if (!event.target.dataset.hasError) {
    event.target.dataset.hasError = "true"; // only once
    event.target.src = 'assets/default.PNG';
  }
}

  onImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        this.showNotification('Image size should be less than 2MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImage = e.target.result;
        // In a real app, you would upload this to your server
        localStorage.setItem('profileImage', e.target.result);
        this.showNotification('Profile image updated successfully');
      };
      reader.readAsDataURL(file);
    }
  }

  editProfile(): void {
    // In a real app, you would navigate to an edit profile page or open a modal
    this.showNotification('Edit profile functionality will be implemented soon', 'error');
  }
  openpopup(){
    this.isPopupOpen=true
  }
  closePopup() {
    this.isPopupOpen = false;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const formData = this.profileForm.getRawValue();
    const existingData = sessionStorage.getItem('userData');
    const sessionData = existingData ? JSON.parse(existingData) : {};
    const updatedSessionData = {
      ...sessionData,          // keep old values
      email: formData.email,
      phone: formData.phone,
      add1: formData.add1,
      add2: formData.add2
    };
    sessionStorage.setItem('userData', JSON.stringify(updatedSessionData));
    const savedData = sessionStorage.getItem('userData');
    if (savedData) {
      this.userData = JSON.parse(savedData);}
      console.log(this.userData);
    const payload = {
      data: {
        "ContactMaster":
          {
            ContactId:this.userData.ContactId,
            ContactName: formData.name,
            Email: formData.email,
            Phone: formData.phone,
            AddressLine1: formData.add1,
            AddressLine2: formData.add2,
            // Designation: formData.designation,
            // Department: formData.department,
            // Bio: formData.bio
          }

      }
    };
    console.log('FINAL PAYLOAD:', payload);
this.authService.UpdateMaster(payload,this.userData.ContactId).subscribe(
  (response) => {
    this.close();

  },
  (error) => {
    console.error('Error fetching points data:', error);
  }
);
  }
  formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} 00:00:00`;
  }
}
