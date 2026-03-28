import { AfterViewInit, Directive, ElementRef, Input, NgZone, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements AfterViewInit, OnDestroy {
  @Input() revealOnce = false;
  @Input() rootMargin = '0px';
  @Input() threshold: number | number[] = 0.15;

  private observer?: IntersectionObserver;

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
    private readonly zone: NgZone
  ) {}

  ngAfterViewInit(): void {
    const element = this.el.nativeElement;
    this.renderer.addClass(element, 'scroll-reveal');

    const win = element.ownerDocument?.defaultView;
    const prefersReduced = win?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      this.renderer.addClass(element, 'is-revealed');
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) {
            return;
          }

          if (entry.isIntersecting) {
            this.renderer.addClass(element, 'is-revealed');
            if (this.revealOnce) {
              this.observer?.unobserve(element);
              this.observer?.disconnect();
              this.observer = undefined;
            }
          } else if (!this.revealOnce) {
            this.renderer.removeClass(element, 'is-revealed');
          }
        },
        {
          root: null,
          rootMargin: this.rootMargin,
          threshold: this.threshold,
        }
      );

      this.observer.observe(element);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
