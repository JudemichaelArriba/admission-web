import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../../services/document.service';
import { Applicant } from '../../../models/applicant.model';
import { ApplicantDocument } from '../../../models/applicant-document.model';

@Component({
  selector: 'app-applicants-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './applicants-details-modal.html',
  styleUrl: './applicants-details-modal.css',
})
export class ApplicantsDetailsModal implements OnInit {
  @Input({ required: true }) applicant!: Applicant;
  @Output() closeModal = new EventEmitter<void>();

  private readonly documentService = inject(DocumentService);

  documents = signal<ApplicantDocument[]>([]);
  isLoadingDocs = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.isLoadingDocs.set(true);
    this.documentService.list(this.applicant.id).subscribe({
      next: (docs) => {
        this.documents.set(docs || []);
        this.isLoadingDocs.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load applicant documents.');
        this.isLoadingDocs.set(false);
      }
    });
  }

  openDocument(doc: ApplicantDocument) {
    if (doc.scan_status === 'infected') return;

    this.documentService.download(this.applicant.id, doc.id).subscribe({
      next: (res) => {
        const body = res.body;
        if (!body || body.byteLength === 0) {
          this.errorMessage.set('Document is empty.');
          return;
        }

        const mime = res.headers.get('Content-Type') || doc.mime_type || 'application/octet-stream';
        const blob = new Blob([body], { type: mime });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          URL.revokeObjectURL(url);
          link.remove();
        }, 100);
      },
      error: () => {
        this.errorMessage.set('Unable to open document securely.');
      }
    });
  }

  formatType(value: string): string {
    if (!value) return 'Unknown';
    return value.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  }

  formatBytes(bytes: number): string {
    if (!bytes && bytes !== 0) return '—';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[i]}`;
  }

  getStatusClass(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':  return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default:         return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  }
}