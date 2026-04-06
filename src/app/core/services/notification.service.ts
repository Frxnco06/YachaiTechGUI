import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  constructor() {}

  success(title: string, text: string = '') {
    this.fireAlert('success', title, text);
  }

  error(title: string, text: string = '') {
    this.fireAlert('error', title, text);
  }

  warning(title: string, text: string = '') {
    this.fireAlert('warning', title, text);
  }

  info(title: string, text: string = '') {
    this.fireAlert('info', title, text);
  }

  private fireAlert(icon: SweetAlertIcon, title: string, text: string) {
    Swal.fire({
      icon: icon,
      title: title,
      text: text,
      confirmButtonColor: '#006a6a', // match secondary color
      customClass: {
        container: 'font-body',
        title: 'font-headline text-primary',
        confirmButton: 'font-headline rounded-lg outline-none'
      }
    });
  }
}
