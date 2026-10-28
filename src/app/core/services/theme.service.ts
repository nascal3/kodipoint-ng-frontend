import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';
import { UserService } from './user.service';

export const DARK_MODE_STORAGE_PREFIX = 'kodipoint-dark-mode:';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly userService = inject(UserService);
  readonly darkMode = signal(false);

  constructor() {
    this.applyUserPreference(this.userService.user());
    effect(() => this.applyUserPreference(this.userService.user()));
  }

  toggle(): void {
    const enabled = !this.darkMode();
    this.darkMode.set(enabled);
    this.applyTheme(enabled);
    const user = this.userService.user();
    if (user) {
      this.document.defaultView?.localStorage.setItem(
        this.storageKey(user.id),
        String(enabled),
      );
    }
  }

  private applyUserPreference(user: ReturnType<UserService['user']>): void {
    const enabled = user
      ? this.document.defaultView?.localStorage.getItem(this.storageKey(user.id)) === 'true'
      : false;
    this.darkMode.set(enabled);
    this.applyTheme(enabled);
  }

  private storageKey(userId: string): string {
    return `${DARK_MODE_STORAGE_PREFIX}${userId}`;
  }

  private applyTheme(enabled: boolean): void {
    this.document.documentElement.classList.toggle('dark-theme', enabled);
  }
}
