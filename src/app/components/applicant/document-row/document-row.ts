import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { DocumentRow } from '../../../models/document-row.model';

@Component({
  selector: '[app-document-row]',
  standalone: true,
  imports: [NgClass, DatePipe],
  templateUrl: './document-row.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentRowComponent {
  @Input({ required: true }) doc!: DocumentRow;
  @Output() open = new EventEmitter<DocumentRow>();
}
