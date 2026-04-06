import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-table.html'
})
export class StatusTableComponent {
  
  registrations: any[] = [];
}