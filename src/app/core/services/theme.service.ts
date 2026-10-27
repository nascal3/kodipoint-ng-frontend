import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly darkMode = signal(false);

  toggle(): void {
    this.darkMode.update((enabled) => !enabled);
    this.document.documentElement.classList.toggle('dark-theme', this.darkMode());
  }
}
