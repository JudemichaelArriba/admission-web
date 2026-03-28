import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../helpers/scroll-reveal/scroll-reveal';

@Component({
  selector: 'app-landing-campus',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './landing-campus.html',
  styleUrl: './landing-campus.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingCampus {}
