import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'; // Add RouterLink
import { AuthService } from '../../../services/auth.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-applicants-tabs',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive], // Ensure these are here
  templateUrl: './applicants-tabs.html'
})
export class ApplicantsTabsComponent {
  constructor(
    private authService: AuthService,
    private dialog: DialogService,
    private router: Router
  ) { }

  logout(): void {
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
      this.authService.logout().subscribe();
    });
  }
}