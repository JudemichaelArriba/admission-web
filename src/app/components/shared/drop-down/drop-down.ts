import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownOption } from '../../../models/dropdown.model';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drop-down.html'
})
export class DropdownComponent {
  @Input() label: string = '';
  @Input() placeholder: string = 'Select an option';
  @Input() options: DropdownOption[] = [];
  @Input() selectedValue: any = null;
  @Input() isLoading: boolean = false;
  @Input() theme: 'dark' | 'light' = 'dark'; 

  @Output() selectionChange = new EventEmitter<any>();

  isOpen = false;
  isDropdownAbove = false;

  constructor(private eRef: ElementRef, private cdr: ChangeDetectorRef) {}

  get isDark(): boolean {
    return this.theme === 'dark';
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggle() {
    if (this.isLoading) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      requestAnimationFrame(() => {
        this.checkSpace();
        this.cdr.detectChanges();
      });
    }
  }

  selectOption(option: DropdownOption) {
    this.selectedValue = option.value;
    this.selectionChange.emit(option.value);
    this.isOpen = false;
  }

  get getSelectedLabel(): string {
    const option = this.options.find(opt => opt.value === this.selectedValue);
    return option ? option.label : this.placeholder;
  }

  private checkSpace() {
    const rect = this.eRef.nativeElement.getBoundingClientRect();
    const dropdownHeight = 260;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    this.isDropdownAbove = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;
  }
}