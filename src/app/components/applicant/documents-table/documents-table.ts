import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { DocumentService } from '../../../services/document.service';
import { AuthService } from '../../../services/auth.service';
import { ApplicantService } from '../../../services/applicants.service';
import { ApplicantDocument } from '../../../models/applicant-document.model';
import { DocumentRow } from '../../../models/document-row.model';
import { DocumentRowComponent } from '../document-row/document-row';

@Component({
  selector: 'app-documents-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DocumentRowComponent],
  templateUrl: './documents-table.html',
  styleUrl: './documents-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsTableComponent implements OnInit {
  private readonly documentService = inject(DocumentService);
  private readonly authService = inject(AuthService);
  private readonly applicantService = inject(ApplicantService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  documents: DocumentRow[] = [];
  isLoading = true;
  isUploading = false;
  errorMessage = '';
  fileError = '';

  private applicantId: number | null = null;

  readonly MAX_FILE_BYTES = 5 * 1024 * 1024;
  readonly ALLOWED_MIME = ['image/png', 'image/jpeg', 'application/pdf'];

  // Update with values allowed by UploadApplicantDocumentRequest
  readonly DOCUMENT_TYPES = [
    'birth_certificate',
    'report_card',
    'good_moral',
    'transcript'
  ];

  form = this.fb.group({
    document_type: ['', Validators.required],
  });

  selectedFile: File | null = null;

  ngOnInit(): void {
    this.resolveApplicantIdAndLoad();
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

  onFileSelected(event: Event): void {
    this.fileError = '';
    this.selectedFile = null;

    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!this.ALLOWED_MIME.includes(file.type)) {
      this.fileError = 'Invalid format. Use PNG, JPG, or PDF.';
      return;
    }
    if (file.size > this.MAX_FILE_BYTES) {
      this.fileError = 'File size exceeds 5MB.';
      return;
    }

    this.selectedFile = file;
  }

  onUpload(): void {
    if (this.isUploading || !this.applicantId) return;

    this.fileError = '';
    if (!this.selectedFile) {
      this.fileError = 'Please select a file.';
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isUploading = true;

    const type = this.form.value.document_type!;
    this.documentService.upload(this.applicantId, this.selectedFile, type)
      .pipe(finalize(() => {
        this.isUploading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (doc) => {
          this.documents = [this.toRow(doc), ...this.documents];
          this.form.reset();
          this.selectedFile = null;
        },
        error: () => {
          this.errorMessage = 'Upload failed. Please try again.';
        }
      });
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

      // Now that headers are exposed, this will actually work!
      const mime = res.headers.get('Content-Type') || doc.mimeType || 'application/octet-stream';
      
      const blob = new Blob([body], { type: mime });
      const url = URL.createObjectURL(blob);

      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      
      // If it's a PDF/Image, browser opens it. Otherwise, it downloads.
      // To force download, uncomment: link.download = doc.filename;

      document.body.appendChild(link);
      link.click();

      // Clean up memory
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


  private inferMime(name: string): string | null {
    const lower = name.toLowerCase();
    if (lower.endsWith('.pdf')) return 'application/pdf';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.png')) return 'image/png';
    return null;
  }



  trackByDocumentId(index: number, item: DocumentRow): number {
    return item.id ?? index;
  }

  private toRow(doc: ApplicantDocument): DocumentRow {
    return {
      id: doc.id,
      typeLabel: this.formatType(doc.document_type),
      filename: doc.original_filename,
      mimeLabel: this.formatMime(doc.mime_type),
      mimeType: doc.mime_type,           // ADD THIS
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
    if (value === 'application/pdf') return 'PDF';
    if (value === 'image/jpeg') return 'JPEG';
    if (value === 'image/png') return 'PNG';
    return value;
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
