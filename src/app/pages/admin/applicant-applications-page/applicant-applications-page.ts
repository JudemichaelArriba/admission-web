import { Component } from "@angular/core";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-applicant-applications-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './applicant-applications-page.html'
})
export class ApplicantApplicationsPage {

  applicants = [
    {
      id: '#ADM-8291', name: 'Julian Marcus Thorne', type: 'Undergraduate',
      email: 'julian.thorne@email.com', phone: '+1 (555) 012-9923',
      course: 'Computer Science', status: 'Pending', date: 'Oct 24, 2023'
    },
    {
      id: '#ADM-8274', name: 'Elara Rose Vance', type: 'Graduate',
      email: 'e.vance@uni-connect.org', phone: '+1 (555) 043-1182',
      course: 'Modern Literature', status: 'Approved', date: 'Oct 22, 2023'
    },
    {
      id: '#ADM-8265', name: 'Marcus Elliot Brynn', type: 'Undergraduate',
      email: 'm.brynn@mail.edu', phone: '+1 (555) 078-3341',
      course: 'Business Administration', status: 'Rejected', date: 'Oct 20, 2023'
    },
  ];

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-emerald-500/20 text-emerald-700 ring-1 ring-emerald-400/40';
      case 'pending': return 'bg-blue-100 text-[#002b4c] ring-1 ring-blue-300/40';
      case 'rejected': return 'bg-red-100 text-red-700 ring-1 ring-red-300/40';
      default: return 'bg-slate-100 text-slate-500';
    }
  }

  getStatusDot(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-emerald-500';
      case 'pending': return 'bg-blue-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  }
}