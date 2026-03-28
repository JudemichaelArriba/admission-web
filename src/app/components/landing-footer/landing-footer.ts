import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-footer.html',
  styleUrl: './landing-footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFooter {}
