import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

export const DARK_MODE_STORAGE_KEY = 'kodipoint-dark-mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly darkMode = signal(this.loadDarkMode());

  constructor() {
    this.applyTheme(this.darkMode());
  }

  toggle(): void {
    const enabled = !this.darkMode();
    this.darkMode.set(enabled);
    this.applyTheme(enabled);
    this.document.defaultView?.localStorage.setItem(DARK_MODE_STORAGE_KEY, String(enabled));
  }

  private loadDarkMode(): boolean {
    return this.document.defaultView?.localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
  }

  private applyTheme(enabled: boolean): void {
    this.document.documentElement.classList.toggle('dark-theme', enabled);
  }
}
