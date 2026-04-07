import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { ApplicantRow } from '../../../models/applicant-row.model';

@Component({
  selector: '[app-applicants-card]',
  standalone: true,
  imports: [NgClass],
  templateUrl: './applicants-card.html',
  styleUrl: './applicants-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicantsCard {
  @Input({ required: true }) applicant!: ApplicantRow;
  @Input({ required: true }) index!: number;
}
