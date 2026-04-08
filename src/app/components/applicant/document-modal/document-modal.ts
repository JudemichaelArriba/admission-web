import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { DocumentService } from '../../../services/document.service';
import { ApplicantDocument } from '../../../models/applicant-document.model';
import { DropdownComponent } from '../../shared/drop-down/drop-down';
import { DropdownOption } from '../../../models/dropdown.model';

@Component({
  selector: 'app-document-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DropdownComponent],
  providers: [TitleCasePipe],
  templateUrl: './document-modal.html',
  styleUrl: './document-modal.css',
})
export class DocumentModal implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly documentService = inject(DocumentService);
  private readonly titleCase = inject(TitleCasePipe);

  @Input() applicantId!: number;
  @Input() existingTypes: string[] = []; 
  @Output() closed = new EventEmitter<void>();
  @Output() uploaded = new EventEmitter<ApplicantDocument>();

  isUploading = false;
  isClosing = false; 
  fileError = '';
  selectedFile: File | null = null;
  dropdownOptions: DropdownOption[] = [];

  readonly DOCUMENT_TYPES = ['birth_certificate', 'report_card', 'good_moral', 'transcript'];
  readonly MAX_FILE_BYTES = 5 * 1024 * 1024;
  readonly ALLOWED_MIME = ['image/png', 'image/jpeg', 'application/pdf'];

  form = this.fb.group({
    document_type: ['', Validators.required],
  });

  ngOnInit(): void {

    const availableTypes = this.DOCUMENT_TYPES.filter(type => !this.existingTypes.includes(type));

    this.dropdownOptions = availableTypes.map(type => ({
      label: this.titleCase.transform(type.replace(/_/g, ' ')),
      value: type
    }));
  }

  onTypeChange(value: string): void {
    this.form.patchValue({ document_type: value });
    this.form.get('document_type')?.markAsTouched();
  }

  onFileSelected(event: Event): void {
    this.fileError = '';
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
    if (this.isUploading || !this.applicantId || !this.selectedFile || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isUploading = true;
    const type = this.form.value.document_type!;

    this.documentService.upload(this.applicantId, this.selectedFile, type)
      .pipe(finalize(() => (this.isUploading = false)))
      .subscribe({
        next: (doc) => {
          this.uploaded.emit(doc);
          this.close(); 
        },
        error: () => (this.fileError = 'Upload failed. Please try again.')
      });
  }

  close() {
    if (this.isClosing) return; 

    this.isClosing = true;
    setTimeout(() => {
      this.closed.emit();
    }, 300);
  }
}