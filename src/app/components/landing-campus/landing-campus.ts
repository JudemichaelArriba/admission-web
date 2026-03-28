import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-campus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-campus.html',
  styleUrl: './landing-campus.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingCampus {}
