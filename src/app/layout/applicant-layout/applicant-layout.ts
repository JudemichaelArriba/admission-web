import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardHeader } from '../../components/applicant/dashboard-header/dashboard-header';
import { ApplicantsTabsComponent } from '../../components/applicant/applicants-tabs/applicants-tabs';

@Component({
  selector: 'app-applicant-layout',
  standalone: true,
  imports: [RouterOutlet, DashboardHeader, ApplicantsTabsComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      <app-dashboard-header></app-dashboard-header>
      <app-applicants-tabs></app-applicants-tabs>
      
      <main class="max-w-7xl mx-auto px-8 py-10">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class ApplicantLayoutComponent { }