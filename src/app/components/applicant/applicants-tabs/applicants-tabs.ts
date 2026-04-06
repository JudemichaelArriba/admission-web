import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-applicants-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './applicants-tabs.html'
})
export class ApplicantsTabsComponent {
  @Input() activeTab: string = 'status';
  @Output() tabChange = new EventEmitter<string>();



  setTab(tab: string) {
    this.tabChange.emit(tab);
  }


}