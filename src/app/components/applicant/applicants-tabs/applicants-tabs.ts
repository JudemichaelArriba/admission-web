import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-applicants-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './applicants-tabs.html'
})
export class ApplicantsTabsComponent {
  @Input() activeTab: string = 'status';
  @Output() tabChange = new EventEmitter<string>();

  constructor(
    private authService: AuthService,
    private dialog: DialogService,
    private router: Router
  ) { }

  setTab(tab: string) {
    this.tabChange.emit(tab);
  }

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

      this.authService.logout().subscribe({
        next: () => {

        },
        error: () => {

        }
      });
    });
  }
}