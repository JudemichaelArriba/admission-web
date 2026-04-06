import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingHero } from '../../components/landing/landing-hero/landing-hero';
import { LandingFeatures } from '../../components/landing/landing-features/landing-features';
import { LandingCampus } from '../../components/landing/landing-campus/landing-campus';
import { LandingCourses } from '../../components/landing/landing-courses/landing-courses';
import { LandingEnding } from '../../components/landing/landing-ending/landing-ending';
import { LandingFooter } from '../../components/landing/landing-footer/landing-footer';
@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    LandingHero,
    LandingFeatures,
    LandingCampus,
    LandingCourses,
    LandingEnding,
    LandingFooter,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {

}
