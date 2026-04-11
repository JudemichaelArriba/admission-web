import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicantsRow } from '../applicants-row/applicants-row';
import { Applicant } from '../../../models/applicant.model';

@Component({
  selector: 'app-applicants-table',
  standalone: true,
  imports: [CommonModule, ApplicantsRow],
  templateUrl: './applicants-table.html'
})
export class ApplicantsTable {
  @Input({ required: true }) data: Applicant[] = [];
}