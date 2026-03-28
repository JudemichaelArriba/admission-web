import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../helpers/scroll-reveal/scroll-reveal';

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './landing-hero.html',
  styleUrl: './landing-hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHero {}
