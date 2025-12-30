import { Component, ElementRef, HostListener, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeComponent } from '../home/home.component';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
  isSidebarOpen = false;
  // notifications: Notification[] = [];
  isNotificationPanelOpen = false;
  notifications: Notification[] = [
    { id: 1, title: 'New Message', message: 'You have received a new message from John.' },
    { id: 2, title: 'Server Update', message: 'Server will be down for maintenance at 10 PM.' },
    { id: 3, title: 'Reminder', message: 'Don’t forget your meeting at 3 PM today.' },
    { id: 4, title: 'Promotion', message: 'Check out our new promotions for this week!' },
    { id: 5, title: 'Alert', message: 'Your password will expire in 3 days.' }
  ];
  private subscription: Subscription = new Subscription();

  @ViewChild('notificationPanel') notificationPanel!: ElementRef
  @ViewChild('notificationButton') notificationButton!: ElementRef;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription.add(
      this.notificationService.notification$.subscribe(notification => {
        // Add new notification to the beginning of the list
        this.notifications.unshift(notification);
        // Optionally open the panel or show an indicator (not requested but good UX)
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // Show a new notification
  toggleNotificationPanel() {
    this.isNotificationPanelOpen = !this.isNotificationPanelOpen;
  }
  closeNotificationPanel() {
    this.isNotificationPanelOpen = false;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  // Close menus when clicking outside
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    // Click handler for closing sidebar when clicking outside
  }

  // Close menus when pressing Escape key
  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler() {
    this.isSidebarOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!this.notificationPanel || !this.notificationButton) return;

    const clickedInsidePanel = this.notificationPanel.nativeElement.contains(target);
    const clickedButton = this.notificationButton.nativeElement.contains(target);

    if (!clickedInsidePanel && !clickedButton) {
      this.isNotificationPanelOpen = false;
    }
  }
}

