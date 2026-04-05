import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-picker.html'
})
export class DatePickerComponent {
  @Input() label: string = '';
  @Input() placeholder: string = 'Select Date';
  @Input() value: string = '';
  @Input() maxDate: string | null = null;
  @Output() valueChange = new EventEmitter<string>();

  isOpen = false;
  viewMode: 'days' | 'months' | 'years' = 'days';
  isDropdownAbove = false;

  currentDate = new Date();
  displayMonth: number;
  displayYear: number;

  days: (number | null)[] = [];
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  years: number[] = [];

  constructor(
    private eRef: ElementRef, 
    private cdr: ChangeDetectorRef 
  ) {
    this.displayMonth = this.currentDate.getMonth();
    this.displayYear = this.currentDate.getFullYear();
    this.generateCalendar();
    this.generateYearList();
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.viewMode = 'days';
    }
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.viewMode = 'days';
      
   
      requestAnimationFrame(() => {
        this.checkSpace();
        this.cdr.detectChanges(); 
      });
    }
  }

  private checkSpace() {
    const hostElement = this.eRef.nativeElement;
    const rect = hostElement.getBoundingClientRect();
    const dropdownHeight = 360; 
    
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    this.isDropdownAbove = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;
  }

  generateCalendar() {
    const firstDay = new Date(this.displayYear, this.displayMonth, 1).getDay();
    const daysInMonth = new Date(this.displayYear, this.displayMonth + 1, 0).getDate();
    this.days = Array(firstDay).fill(null).concat(
      Array.from({ length: daysInMonth }, (_, i) => i + 1)
    );
  }

  generateYearList() {
    const startYear = this.displayYear - 80;
    const endYear = this.displayYear + 20;
    this.years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).reverse();
  }

  isDateDisabled(day: number | null): boolean {
    if (!day || !this.maxDate) return false;
    const cellDate = new Date(this.displayYear, this.displayMonth, day);
    const limitDate = new Date(this.maxDate);
    limitDate.setHours(0, 0, 0, 0);
    cellDate.setHours(0, 0, 0, 0);
    return cellDate > limitDate; 
  }

  selectYear(year: number) {
    this.displayYear = year;
    this.viewMode = 'months';
  }

  selectMonth(index: number) {
    this.displayMonth = index;
    this.generateCalendar();
    this.viewMode = 'days';
  }

  selectDate(day: number | null) {
    if (!day || this.isDateDisabled(day)) return;
    const date = new Date(this.displayYear, this.displayMonth, day);
    this.value = date.toISOString().split('T')[0];
    this.valueChange.emit(this.value);
    this.isOpen = false;
  }

  changeMonth(diff: number) {
    this.displayMonth += diff;
    if (this.displayMonth > 11) { this.displayMonth = 0; this.displayYear++; }
    if (this.displayMonth < 0) { this.displayMonth = 11; this.displayYear--; }
    this.generateCalendar();
  }
}