import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../../../components/admin/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [AdminSidebarComponent, RouterOutlet],
  template: `
    <div class="min-h-screen bg-[#f9f9fe]">

      <app-admin-sidebar #sidebar></app-admin-sidebar>
      <main
        class="min-h-screen flex flex-col transition-all duration-300 overflow-y-auto"
        [class.pl-64]="sidebar.isOpen()"
        [class.pl-20]="!sidebar.isOpen()">
        <router-outlet></router-outlet>
      </main>

    </div>
  `
})
export class AdminDashboardComponent { }