import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-ending',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-ending.html',
  styleUrl: './landing-ending.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingEnding {}
