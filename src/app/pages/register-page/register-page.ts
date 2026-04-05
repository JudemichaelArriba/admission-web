import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/course.model';
import { DatePickerComponent } from '../../components/shared/date-picker/date-picker';
@Component({
  selector: 'app-register-page',
  imports: [CommonModule, DatePickerComponent],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  currentStep = 1;
  courses: Course[] = [];
  isLoading = true;
  birthDate: string = '';

  today: string = new Date().toISOString().split('T')[0];
  constructor(private courseService: CourseService) { }


  ngOnInit() {
    this.loadActiveCourses();
  }


  loadActiveCourses() {
    this.isLoading = true;
    this.courseService.getActiveCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load courses', err);
        this.isLoading = false;
      }
    });
  }


  onDateChange(date: string) {
    this.birthDate = date;
    console.log('Selected Date:', date);
  }



  nextStep() {
    if (this.currentStep < 4) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

}
