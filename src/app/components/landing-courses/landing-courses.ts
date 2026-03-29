import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../helpers/scroll-reveal/scroll-reveal';

@Component({
  selector: 'app-landing-courses',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './landing-courses.html',
  styleUrl: './landing-courses.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingCourses {}
