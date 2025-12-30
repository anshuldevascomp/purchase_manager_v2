import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit {

  num1: number = 0;
  num2: number = 0;
  captchaAnswer: number = 0;
  userCaptchaAnswer: string = '';
  captchaError: boolean = false;
  successMessage: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.generateCaptcha();
  }

  generateCaptcha(): void {
    this.num1 = Math.floor(Math.random() * 10);
    this.num2 = Math.floor(Math.random() * 10);
    this.captchaAnswer = this.num1 + this.num2;
    this.userCaptchaAnswer = '';
    this.captchaError = false;
  }

  onSubmit(): void {
    if (parseInt(this.userCaptchaAnswer) === this.captchaAnswer) {
      this.successMessage = true;
      this.captchaError = false;
      // Here you would typically handle the form submission (e.g., send data to API)
      console.log('Form submitted successfully!');

      // Reset after successful submission (optional)
      setTimeout(() => {
        this.successMessage = false;
        this.generateCaptcha();
      }, 3000);

    } else {
      this.captchaError = true;
      this.successMessage = false;
    }
  }

}
