import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-hero.html',
  styleUrl: './landing-hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHero {}
