import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, NgZone, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBar implements AfterViewInit, OnDestroy {
  activeSection = 'home';

  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private sections: HTMLElement[] = [];
  private sectionOffsets: Array<{ id: string; top: number }> = [];
  private rafId: number | null = null;
  private removeListeners?: () => void;

  private readonly sectionIds = ['home', 'features', 'campus', 'roadmap', 'apply'];
  private readonly markerOffset = 64;

  ngAfterViewInit(): void {
    const sections = this.sectionIds
      .map((id) => this.document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    if (!sections.length) {
      return;
    }

    this.sections = sections;

    const win = this.document.defaultView;
    if (!win) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      const onScroll = () => {
        if (this.rafId !== null) {
          return;
        }
        this.rafId = win.requestAnimationFrame(() => {
          this.rafId = null;
          this.updateActiveSectionFromScroll();
        });
      };

      const onResize = () => {
        this.updateSectionOffsets();
        onScroll();
      };

      win.addEventListener('scroll', onScroll, { passive: true });
      win.addEventListener('resize', onResize, { passive: true });
      win.addEventListener('load', onResize, { passive: true });
      this.removeListeners = () => {
        win.removeEventListener('scroll', onScroll);
        win.removeEventListener('resize', onResize);
        win.removeEventListener('load', onResize);
      };

      this.updateSectionOffsets();
      onScroll();
    });
  }

  ngOnDestroy(): void {
    this.removeListeners?.();
    if (this.rafId !== null) {
      const win = this.document.defaultView;
      if (win) {
        win.cancelAnimationFrame(this.rafId);
      }
      this.rafId = null;
    }
  }

  setActive(sectionId: string): void {
    if (this.activeSection === sectionId) {
      return;
    }
    this.activeSection = sectionId;
    this.cdr.markForCheck();
  }

  private updateSectionOffsets(): void {
    const win = this.document.defaultView;
    if (!win) {
      return;
    }

    this.sectionOffsets = this.sections
      .map((section) => ({
        id: section.id,
        top: section.getBoundingClientRect().top + win.scrollY,
      }))
      .sort((a, b) => a.top - b.top);
  }

  private updateActiveSectionFromScroll(): void {
    const win = this.document.defaultView;
    if (!win || !this.sectionOffsets.length) {
      return;
    }

    const scrollPos = win.scrollY + this.markerOffset + 1;
    let next = this.sectionOffsets[0].id;

    for (const section of this.sectionOffsets) {
      if (section.top <= scrollPos) {
        next = section.id;
      } else {
        break;
      }
    }

    if (next !== this.activeSection) {
      this.zone.run(() => {
        this.activeSection = next;
        this.cdr.markForCheck();
      });
    }
  }
}
