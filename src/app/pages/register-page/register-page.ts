import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/course.model';
import { DatePickerComponent } from '../../components/shared/date-picker/date-picker';
import { DropdownComponent } from '../../components/shared/drop-down/drop-down';
import { DropdownOption } from '../../models/dropdown.model';
@Component({
  selector: 'app-register-page',
  imports: [CommonModule, DatePickerComponent, DropdownComponent],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  currentStep = 1;
  courses: Course[] = [];
  isLoading = true;
  birthDate: string = '';
  selectedCourse: any = null;

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

        this.isLoading = false;
      }
    });
  }


  onDateChange(date: string) {
    this.birthDate = date;

  }



  nextStep() {
    if (this.currentStep < 4) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  get courseOptions(): DropdownOption[] {
    return this.courses.map(c => ({
      label: c.course_name,
      value: c.course_code,
      sublabel: c.course_code
    }));
  }

  onCourseSelected(courseCode: string) {
    this.selectedCourse = courseCode;
  }
}
