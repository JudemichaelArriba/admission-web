import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-roadmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-roadmap.html',
  styleUrl: './landing-roadmap.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingRoadmap {}
