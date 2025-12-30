import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  id: number;
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  notification$ = this.notificationSubject.asObservable();

  constructor() { }

  addNotification(title: string, message: string) {
    const notification: Notification = {
      id: Date.now(), // simple unique id
      title,
      message
    };
    this.notificationSubject.next(notification);
  }
}
