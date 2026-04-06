import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeader } from '../../../components/applicant/dashboard-header/dashboard-header';
import { StatusTableComponent } from '../../../components/applicant/status-table/status-table';
import { ApplicantsTabsComponent } from '../../../components/applicant/applicants-tabs/applicants-tabs';
@Component({
  selector: 'app-applicant-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardHeader, StatusTableComponent, ApplicantsTabsComponent],
  templateUrl: './applicants-dashbaord.html',
})
export class ApplicantDashboardComponent {
  activeTab = 'status';
}