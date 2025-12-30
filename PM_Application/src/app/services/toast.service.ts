// toast.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new BehaviorSubject<Toast | null>(null);
  toast$ = this.toastSubject.asObservable();

  showSuccess(message: string) {
    this.toastSubject.next({ message, type: 'success' });
    this.autoClear();
  }

  showError(message: string) {
    this.toastSubject.next({ message, type: 'error' });
    this.autoClear();
  }

  private autoClear() {
    setTimeout(() => this.toastSubject.next(null), 3000); // 3s
  }
}
