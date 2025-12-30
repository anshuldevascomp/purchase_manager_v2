import { Component,OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isRedemptionPopup = false;
  greyPoints: number = 2200;
  rollingGreyPoints: string[] = ['0', '0', '0', '0', '0'];
  rollingGreenPoints: string[] = ['0', '0', '0', '0', '0'];
  banner: any[] = [];
  pointsData: any;
  greypointsData:any;
  paymentterms: any;
  ispaymenttermsbutton4x=false;
  ispaymenttermsbutton2x=false;
  ispaymenttermsbutton1x=false;
  greenPoints: number = 145;
  buttonname4x:string='';
  buttonname2x:string='';
  buttonname1x:string='';
  creditdays:number=15;
  isdatepassed4x=false;
  isdatepassed2x=false;
  isdatepassed1x=false;
  showPopup = false;
popupMessage = '';
  creditDaysNum:number=0;
  redeemPoints: number = 0;
  redeemType: string = 'wallet';
  userData: any = {};
  apiUrl: string = ''
  userName:string = ''
  // imageUrl = 'http://app.salesxceed.com/purchasemanager'

  constructor(private authService: ApiService, private notificationService: NotificationService) {}

  ngOnInit() {
    debugger
    const data:any = sessionStorage.getItem('userData');
    this.userData = JSON.parse(data)
    this.userName = this.userData.ContactName

    // this.pointsService.getPoints().subscribe(data => {
    //   this.greyPoints = data.greyPoints;
    //   this.greenPoints = data.greenPoints;
    // });
    this.apiUrl = this.authService.getApiUrl();
    console.log(this.apiUrl);

    this.executePmt(this.userData.ContactId);
   this.loadBannerData();
   this.loadPointsData(this.userData.ContactId);
    // this.banner = [
    //   {
    //     id: 1,
    //     image: `${this.apiUrl}/images/getImages/manger.png`
    //   },

    // ]
  }
  loadPointsData(ContactId:string ): void {
    let QueryId='GreenPointsData';
    this.authService.getdata(ContactId,QueryId).subscribe(
      (response) => {
        console.log('Points data:', response);
        this.pointsData = response;
        this.greenPoints=this.pointsData[0].data[0].netgreenpoints;
        // this.greyPoints=this.pointsData[0].data[0].netgreypoints;
        // this.startRollingAnimation(this.greyPoints);
        this.startGreenRollingAnimation(this.greenPoints);
      },
      (error) => {
        console.error('Error fetching points data:', error);
      }
    );
  }
  loadGreyPointsData(ContactId:string,creditDays:number ): void {
    let QueryId='GreyPointsData';
    this.authService.getgreydata(ContactId,QueryId,creditDays).subscribe(
      (response) => {
        console.log('Points data:', response);
        this.greypointsData = response;
        // this.greenPoints=this.pointsData[0].data[0].netgreenpoints;
        this.greyPoints=this.greypointsData[0].data[0].netgreypoints;
        this.startRollingAnimation(this.greyPoints);
        // this.startGreenRollingAnimation(this.greenPoints);
      },
      (error) => {
        console.error('Error fetching points data:', error);
      }
    );
  }
  loadBannerData( ): void {
    let QueryId='BannerData';
    this.authService.geteventsdata(QueryId).subscribe(
      (response) => {
        console.log('BannerData:', response);
        this.banner = [
          {
            id: 1,
            image: `${this.apiUrl}/images/viewImage/Banner_${response[0].data[0].tabId}.PNG`,
            description:response[0].data[0].description
          },

        ]
        console.log(this.banner);
      },
      (error) => {
        console.error('Error fetching BannerData:', error);
      }
    );
  }
  handleImgError(event: any) {
    if (!event.target.dataset.hasError) {
      event.target.dataset.hasError = "true"; // only once
      event.target.src = 'assets/default_banner.PNG';
    }
  }
  showDueDateAlert(label: string, dueDate: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(23, 59, 59, 999);

    const diff = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 2) this.openPopup(`If you do not clear your outstanding payment within the next 2 days, you will lose the opportunity to convert your grey points into green points, and your grey points will lapse. Please do not miss this chance to convert your ${label} points into rupees and make the payment at the earliest.
    Thank you!`);
    else if (diff === 1) this.openPopup(`If you do not clear your outstanding payment within the next 1 days, you will lose the opportunity to convert your grey points into green points, and your grey points will lapse. Please do not miss this chance to convert your ${label} points into rupees and make the payment at the earliest.
    Thank you!`);
    else if (diff === 0) this.openPopup(`If you do not clear your outstanding payment within today, you will lose the opportunity to convert your grey points into green points, and your grey points will lapse. Please do not miss this chance to convert your ${label} points into rupees and make the payment at the earliest.
    Thank you!`);
  }



  executePmt(ContactId:string ): void {

    this.authService.executePmtdata(ContactId).subscribe(
      (response) => {
        console.log('PaymentTerms:', response);
        this.paymentterms = response;
        if(this.paymentterms[1][0].creditDays){
          // this.ispaymenttermsbutton1x=true;
        } else{
          this.creditdays=this.paymentterms[0][0].CreditDays;
          this.creditDaysNum = Number(this.creditdays);
          const today = new Date();
          const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          let currentDate = new Date(firstDayThisMonth);
          currentDate.setDate(currentDate.getDate() + this.creditDaysNum - 1);
           const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
           const due = new Date(currentDate);
           due.setHours(23, 59, 59, 999);
          this. isdatepassed4x=due<new Date();
          // if (this.isTwoDaysBefore(currentDate)) {
          //   this.openPopup(`Your 4X payment due on ${this.buttonname4x} is coming in 2 days!`);
          // }
          this.showDueDateAlert("4X", currentDate);
          if(this.creditDaysNum==30){
            this.ispaymenttermsbutton4x=!this.paymentterms[1][0].creditDays;
            this.ispaymenttermsbutton2x=this.paymentterms[1][0].creditDays;
           this.ispaymenttermsbutton1x=false;

           this.buttonname4x = `${currentDate.toLocaleDateString('en-US', options)} 4X`;
           }
           else{
            this.ispaymenttermsbutton4x=!this.paymentterms[1][0].creditDays;
            this.ispaymenttermsbutton2x=!this.paymentterms[1][0].creditDays;
           this.ispaymenttermsbutton1x=true;
            this.buttonname4x = `${currentDate.toLocaleDateString('en-US', options)} 4X`;
            currentDate.setDate(currentDate.getDate() +10);
            this.showDueDateAlert("2X", currentDate);
           this.buttonname2x = `${currentDate.toLocaleDateString('en-US', options)} 2X`;
           const due1 = new Date(currentDate);
           due1.setHours(23, 59, 59, 999);
           this. isdatepassed2x=due1< new Date();
           currentDate.setDate(currentDate.getDate() + 5);
           this.buttonname1x = `${currentDate.toLocaleDateString('en-US', options)} 1X`;
           const due = new Date(currentDate);
           due.setHours(23, 59, 59, 999);
           this.showDueDateAlert("1X", currentDate);
           this. isdatepassed1x=due<new Date();
           }
        }
        this.loadGreyPointsData(ContactId,this.creditDaysNum)

      },
      (error) => {
        console.error('Error fetching points data:', error);
      }
    );

  }
  toggleRedemption(){
    this.isRedemptionPopup=true
  }
  closeRedemptionPopup() {
    this.isRedemptionPopup = false;
    this.redeemPoints = 0;
  }
  openPopup(message: string) {
    this.popupMessage = message;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }


  startRollingAnimation(finalValue: number) {
    const finalDigits = finalValue.toString().padStart(5, '0').split('');
    this.rollingGreyPoints = ['0', '0', '0', '0', '0'];
    // this.rollingGreyPoints = ['0', '0', '0', '0', '0'];

    let currentIndex = 0;
    let cycleCount = 0;
    const maxCycle = 10; // number of cycles before locking digit

    const interval = setInterval(() => {
      // Roll current digit
      this.rollingGreyPoints[currentIndex] = ((+this.rollingGreyPoints[currentIndex] + 1) % 10).toString();

      cycleCount++;

      // After maxCycle rolls, lock the digit to final value and move forward
      if (cycleCount >= maxCycle) {
        this.rollingGreyPoints[currentIndex] = finalDigits[currentIndex];
        currentIndex++;
        cycleCount = 0;
      }

      if (currentIndex >= finalDigits.length) {
        clearInterval(interval); // Stop animation when all digits set
      }
    }, 50);
  }
  startGreenRollingAnimation(finalValue: number) {
    const finalDigits = finalValue.toString().padStart(5, '0').split('');
    this.rollingGreenPoints = ['0', '0', '0', '0', '0'];

    let currentIndex = 0;
    let cycleCount = 0;
    const maxCycle = 10; // number of cycles before locking digit

    const interval = setInterval(() => {
      // Roll current digit
      this.rollingGreenPoints[currentIndex] = ((+this.rollingGreenPoints[currentIndex] + 1) % 10).toString();

      cycleCount++;

      // After maxCycle rolls, lock the digit to final value and move forward
      if (cycleCount >= maxCycle) {
        this.rollingGreenPoints[currentIndex] = finalDigits[currentIndex];
        currentIndex++;
        cycleCount = 0;
      }

      if (currentIndex >= finalDigits.length) {
        clearInterval(interval); // Stop animation when all digits set
      }
    }, 50);
  }
  incrementRedeemPoints() {
    this.redeemPoints = Math.min(this.redeemPoints + 1, this.greenPoints);
  }

  decrementRedeemPoints() {
    this.redeemPoints = Math.max(this.redeemPoints - 1, 1);
  }

  RedemptionRequest() {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
    const payload = {
      data: {
        "greenpts_adjust":
          {
           CompanyId:"00000093",
           TxnNo:"",
           TxnDate:formattedDate,
           Type:"Redeem",
           ContactId:this.userData.ContactId,
           Adjust_Points:-this.redeemPoints,
           CreatedBy:this.userData.ContactId,
           CreatedDate:formattedDate,
          }

      }
    };
    console.log('FINAL PAYLOAD:', payload);
this.authService.RedemptionRequest(payload).subscribe(
  (response) => {
    const pointsRedeemed = this.redeemPoints;
    this.closeRedemptionPopup();
    this.notificationService.addNotification('Redemption Successful', `You have redeemed ${pointsRedeemed} points.`);
    this.loadPointsData(this.userData.ContactId);

  },
  (error) => {
    console.error('Error fetching points data:', error);
  }
);
  }
}

