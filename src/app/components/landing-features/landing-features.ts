import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../helpers/scroll-reveal/scroll-reveal';

@Component({
  selector: 'app-landing-features',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './landing-features.html',
  styleUrl: './landing-features.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFeatures {}
