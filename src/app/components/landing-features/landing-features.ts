import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-features.html',
  styleUrl: './landing-features.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFeatures {}
