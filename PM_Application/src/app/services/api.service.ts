import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
    private apiUrl = 'http://192.168.0.128:5000/api';
    //  private apiUrl = 'https://ascomp.salesxceed.com:5000/api';
  // private apiUrl = 'https://c0320e7d265d.ngrok-free.app/api';


  constructor(private http: HttpClient) {}

  getApiUrl(): string {
    return this.apiUrl;
  }

  login(data: { identifier: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }


  sendOtp(identifier: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/sendOtp`, { identifier });
  }

  verifyOtp(identifier: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verifyOtp`, { identifier, otp });
  }


  getDashboardData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }
  getdata(ContactId:string,QueryId:string): Observable<any > {
    // const contactId = sessionStorage.getItem('contactId');
    const payload = {
      contactId: ContactId,
    };
    return this.http.post(`${this.apiUrl}/config/getPrequeryData2?QueryId=${QueryId}`, payload);
  }
  executePmtdata(ContactId:string): Observable<any > {
    // const contactId = sessionStorage.getItem('contactId');
    const payload = {
      ContactId: ContactId,
    };
    return this.http.post(`${this.apiUrl}/config/executePmt`, payload);
  }
  geteventsdata(QueryId:string): Observable<any > {
    // const contactId = sessionStorage.getItem('contactId');
    const payload = {

    };
    return this.http.post(`${this.apiUrl}/config/getPrequeryData2?QueryId=${QueryId}`, payload);
  }

  getImage(): Observable<any> {
    return this.http.get(`${this.apiUrl}/images`);
  }
  getItemname(ItemId:String): Observable<any > {
    // const contactId = sessionStorage.getItem('contactId');
    const payload = {
      ItemId: ItemId,
    };
    return this.http.post(`${this.apiUrl}/config/getItemName`, payload);
  }
  getgreydata(ContactId:string,QueryId:string,param:number): Observable<any > {
    // const contactId = sessionStorage.getItem('contactId');
    const payload = {
      contactId: ContactId,
      param:param
    };
    return this.http.post(`${this.apiUrl}/config/getPrequeryData2?QueryId=${QueryId}`, payload);
  }
  getrestrauntdata(ContactId:string): Observable<any > {
    // const contactId = sessionStorage.getItem('contactId');
    const payload = {
      ContactId: ContactId,
    };
    return this.http.post(`${this.apiUrl}/config/getPartyData`, payload);
  }
  UpdateMaster(payload:any,ContactId:string): Observable<any > {
    // const contactId = sessionStorage.getItem('contactId');

    return this.http.put(`${this.apiUrl}/master/savemaster/${ContactId}`, payload);
  }
  RedemptionRequest(payload:any): Observable<any > {
    // const contactId = sessionStorage.getItem('contactId');

    return this.http.post(`${this.apiUrl}/master/savemaster/`, payload);
  }
  getgrowthpercent(ContactId:string): Observable<any > {
    // const contactId = sessionStorage.getItem('contactId');
    const payload = {
      ContactId: ContactId,
    };
    return this.http.post(`${this.apiUrl}/config/growthpercent`, payload);
  }

}
