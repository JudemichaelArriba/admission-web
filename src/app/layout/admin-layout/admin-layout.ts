import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
      <div class="min-h-screen bg-[#f9f9fe]">
        <main class="w-full">
          <router-outlet></router-outlet>
        </main>
      </div>
  `
})
export class AdminLayoutComponent { }