import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../helpers/scroll-reveal/scroll-reveal';

@Component({
  selector: 'app-landing-roadmap',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './landing-roadmap.html',
  styleUrl: './landing-roadmap.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingRoadmap {}
