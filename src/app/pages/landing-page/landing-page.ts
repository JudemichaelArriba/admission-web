import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingHero } from '../../components/landing-hero/landing-hero';
import { LandingFeatures } from '../../components/landing-features/landing-features';
import { LandingCampus } from '../../components/landing-campus/landing-campus';
import { LandingRoadmap } from '../../components/landing-roadmap/landing-roadmap';
import { LandingEnding } from '../../components/landing-ending/landing-ending';
import { LandingFooter } from '../../components/landing-footer/landing-footer';
@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    LandingHero,
    LandingFeatures,
    LandingCampus,
    LandingRoadmap,
    LandingEnding,
    LandingFooter,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {

}
