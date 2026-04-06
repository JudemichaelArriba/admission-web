import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeader } from '../../../components/applicant/dashboard-header/dashboard-header';
import { StatusTableComponent } from '../../../components/applicant/status-table/status-table';

@Component({
  selector: 'app-applicant-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardHeader, StatusTableComponent],
  templateUrl: './applicants-dashbaord.html',
})
export class ApplicantDashboardComponent {
  activeTab = 'status';
}