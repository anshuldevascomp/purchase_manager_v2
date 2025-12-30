import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from 'src/app/services/toast.service';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] // optional, if you want extra styling
})
export class LoginComponent implements OnDestroy {
  // 🔹 Properties for ngModel binding
  showForm = false;
  mobile: string = '';
  otp: string = '';

  // OTP related properties
  isOtpSent = false;
  isResendDisabled = false;
  countdown = 0;
  private countdownSubscription: Subscription | null = null;

  constructor(private authService: ApiService,private router: Router,private toast: ToastService) {}

  // 🔹 Methods for button clicks
  getOtp() {
    if (!this.mobile) {
      this.toast.showError('Please enter a mobile number');
      return;
    }

    console.log('OTP requested for:', this.mobile);
    this.authService.sendOtp(this.mobile).subscribe({
      next: (res) => {
        this.isOtpSent = true;
        this.startCountdown();
        this.toast.showSuccess('OTP sent successfully \ud83c\udf89');
      },
      error: (err) => {
        console.error('Error sending OTP:', err);
        this.toast.showError('Failed to send OTP \u274c');
      }
    });
  }

  resendOtp() {
    if (this.isResendDisabled) return;

    this.authService.sendOtp(this.mobile).subscribe({
      next: (res) => {
        this.startCountdown();
        this.toast.showSuccess('OTP resent successfully \ud83c\udf89');
      },
      error: (err) => {
        console.error('Error resending OTP:', err);
        this.toast.showError('Failed to resend OTP \u274c');
      }
    });
  }

  private startCountdown() {
    this.isResendDisabled = true;
    this.countdown = 30; // 30 seconds countdown

    // Clear any existing countdown
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }

    this.countdownSubscription = interval(1000).pipe(
      takeWhile(() => this.countdown > 0)
    ).subscribe(() => {
      this.countdown--;
      if (this.countdown === 0) {
        this.isResendDisabled = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  submitOtp() {
    console.log('OTP submitted:', this.otp);
    this.authService.verifyOtp(this.mobile, this.otp).subscribe({
      next: (res) => {
        // console.log('OTP verified successfully:', res);
        this.toast.showSuccess('Login successful! 🎉');
        sessionStorage.setItem("userData", JSON.stringify(res.data))
        this.router.navigate(['/app/home'], { replaceUrl: true });
      },
      error: (err) => {
        console.error('Error verifying OTP:', err);
        this.toast.showError('Invalid OTP ❌');
        // alert('Invalid OTP');
      }
    });



    // this.router.navigate(['/superchamp']);
    // TODO: Call API to verify OTP
  }
}
