import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { DocumentService } from '../../../services/document.service';
import { AuthService } from '../../../services/auth.service';
import { ApplicantService } from '../../../services/applicants.service';
import { ApplicantDocument } from '../../../models/applicant-document.model';
import { DocumentRow } from '../../../models/document-row.model';
import { DocumentRowComponent } from '../document-row/document-row';
import { DocumentModal } from '../document-modal/document-modal';

@Component({
  selector: 'app-documents-table',
  standalone: true,
  imports: [CommonModule, DocumentRowComponent, DocumentModal],
  templateUrl: './documents-table.html',
  styleUrl: './documents-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsTableComponent implements OnInit {
  private readonly documentService = inject(DocumentService);
  private readonly authService = inject(AuthService);
  private readonly applicantService = inject(ApplicantService);
  private readonly cdr = inject(ChangeDetectorRef);

  documents: DocumentRow[] = [];
  isLoading = true;
  errorMessage = '';
  showModal = false;
  applicantId: number | null = null;

  ngOnInit(): void {
    this.resolveApplicantIdAndLoad();
  }


  getUploadedTypeKeys(): string[] {
    return this.documents.map(doc => doc.rawType || '');
  }

  private resolveApplicantIdAndLoad(): void {
    const stored = this.authService.getApplicantId();
    if (stored) {
      this.applicantId = stored;
      this.loadDocuments();
      return;
    }

    this.applicantService.getMe().subscribe({
      next: (me) => {
        this.applicantId = me?.id ?? null;
        this.loadDocuments();
      },
      error: () => {
        this.errorMessage = 'Unable to load applicant profile.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private loadDocuments(): void {
    if (!this.applicantId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.documentService.list(this.applicantId)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (docs) => {
          this.documents = (docs ?? []).map(d => this.toRow(d));
        },
        error: () => {
          this.documents = [];
          this.errorMessage = 'Unable to load your documents.';
        }
      });
  }

  onUploadSuccess(newDoc: ApplicantDocument): void {
    this.documents = [this.toRow(newDoc), ...this.documents];
    this.showModal = false;
    this.cdr.markForCheck();
  }

  onOpenDocument(doc: DocumentRow): void {
    if (!this.applicantId) return;

    this.documentService.download(this.applicantId, doc.id).subscribe({
      next: (res) => {
        const body = res.body;
        if (!body || body.byteLength === 0) {
          this.errorMessage = 'Document is empty.';
          this.cdr.markForCheck();
          return;
        }

        const mime = res.headers.get('Content-Type') || doc.mimeType || 'application/octet-stream';
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
        this.errorMessage = 'Unable to open document.';
        this.cdr.markForCheck();
      }
    });
  }

  trackByDocumentId(index: number, item: DocumentRow): number {
    return item.id ?? index;
  }

  private toRow(doc: ApplicantDocument): DocumentRow {
    return {
      id: doc.id,
      rawType: doc.document_type,
      typeLabel: this.formatType(doc.document_type),
      filename: doc.original_filename,
      mimeLabel: this.formatMime(doc.mime_type),
      mimeType: doc.mime_type,
      sizeLabel: this.formatBytes(doc.file_size),
      scanStatus: doc.scan_status,
      createdAt: doc.created_at,
      canOpen: doc.scan_status !== 'infected',
    };
  }

  private formatType(value: string): string {
    return value.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  }

  private formatMime(value: string): string {
    const map: Record<string, string> = {
      'application/pdf': 'PDF',
      'image/jpeg': 'JPEG',
      'image/png': 'PNG'
    };
    return map[value] || value;
  }

  private formatBytes(bytes: number): string {
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
}