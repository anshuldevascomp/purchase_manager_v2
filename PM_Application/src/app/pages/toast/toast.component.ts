import { Component } from '@angular/core';
import { ToastService,Toast } from 'src/app/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent {
  toast: Toast | null = null;

  constructor(private toastService: ToastService) {
    this.toastService.toast$.subscribe((t) => (this.toast = t));
  }
}
