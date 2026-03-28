import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TopBar } from '../../components/top-bar/top-bar';



@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule,RouterModule,TopBar],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css',
})
export class PublicLayout {

}
