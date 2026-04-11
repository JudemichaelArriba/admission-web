import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.html'
})
export class AdminSidebarComponent {

  isOpen = signal(true);

  toggleSidebar() {
    this.isOpen.update(val => !val);
  }

  onLogoutClick() {
    console.log('Logging out...');
  }

  getUserInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}