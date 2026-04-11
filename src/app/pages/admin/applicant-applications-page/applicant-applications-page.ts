import { Component, OnInit, signal, inject, computed } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Added for [(ngModel)]
import { ApplicantService } from "../../../services/applicants.service";
import { ApplicantsTable } from "../../../components/admin/applicants-table/applicants-table";
import { Applicant } from '../../../models/applicant.model';

@Component({
  selector: 'app-applicant-applications-page',
  standalone: true,
  imports: [CommonModule, ApplicantsTable, FormsModule],
  templateUrl: './applicant-applications-page.html'
})
export class ApplicantApplicationsPage implements OnInit {
  private applicantService = inject(ApplicantService);
  
  // State Signals
  private allApplicants = signal<Applicant[]>([]);
  isLoading = signal(true);
  
  // Filter Signals
  searchTerm = signal('');
  activeFilter = signal<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Computed signal: Automatically updates when allApplicants, searchTerm, or activeFilter changes
  filteredApplicants = computed(() => {
    let list = this.allApplicants();
    const search = this.searchTerm().toLowerCase().trim();
    const filter = this.activeFilter().toLowerCase();

    // Filter by Status
    if (filter !== 'all') {
      list = list.filter(a => a.status?.toLowerCase() === filter);
    }

    // Search by Name or ID
    if (search) {
      list = list.filter(a => 
        a.first_name.toLowerCase().includes(search) || 
        a.last_name.toLowerCase().includes(search) ||
        a.id.toString().includes(search)
      );
    }

    return list;
  });

  ngOnInit() {
    this.loadApplicants();
  }

  loadApplicants() {
    this.isLoading.set(true);
    this.applicantService.getApplicants().subscribe({
      next: (res) => {
        this.allApplicants.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  setFilter(filter: 'all' | 'pending' | 'approved' | 'rejected') {
    this.activeFilter.set(filter);
  }
}