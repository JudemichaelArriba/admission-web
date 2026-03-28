import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../helpers/scroll-reveal/scroll-reveal';

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './landing-footer.html',
  styleUrl: './landing-footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFooter {}
