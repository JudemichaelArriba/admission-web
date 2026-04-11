import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DialogService } from '../../../services/dialog.service'; 
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.html'
})
export class AdminSidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(DialogService); 

  isOpen = signal(true);
  currentUser = signal<User | null>(null);

  ngOnInit() {
    this.currentUser.set(this.authService.getUser());
  }

  toggleSidebar() {
    this.isOpen.update(val => !val);
  }


  onLogoutClick() {
    this.dialog.confirm(
      'Sign Out',
      'Are you sure you want to log out of your session?',
      () => {
        this.dialog.close();
        this.performLogout();
      },
      () => {
        this.dialog.close();
      },
      'Log Out',
      'Cancel'
    );
  }

  private performLogout(): void {
    this.router.navigate(['/login']).then(() => {
      this.authService.logout().subscribe({
        error: (err) => {
          console.error('Session cleanup failed', err);
          localStorage.clear();
        }
      });
    });
  }

  getUserInitials(name: string | undefined): string {
    if (!name) return 'AD';
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}