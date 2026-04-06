import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../../helpers/scroll-reveal/scroll-reveal';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-ending',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective, RouterLink],
  templateUrl: './landing-ending.html',
  styleUrl: './landing-ending.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingEnding {}
