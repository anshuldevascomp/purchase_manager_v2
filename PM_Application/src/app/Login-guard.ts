import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');

    if (token) {
      // user already logged in → skip login page
      this.router.navigate(['/app/home'], { replaceUrl: true });
      return false;
    }

    return true;
  }
}
