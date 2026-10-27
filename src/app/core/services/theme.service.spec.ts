import { TestBed } from '@angular/core/testing';
import { DARK_MODE_STORAGE_KEY, ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ThemeService] });
    localStorage.removeItem(DARK_MODE_STORAGE_KEY);
    document.documentElement.classList.remove('dark-theme');
  });

  afterEach(() => {
    localStorage.removeItem(DARK_MODE_STORAGE_KEY);
    document.documentElement.classList.remove('dark-theme');
  });

  it('restores the saved dark mode preference', () => {
    localStorage.setItem(DARK_MODE_STORAGE_KEY, 'true');

    const service = TestBed.inject(ThemeService);

    expect(service.darkMode()).toBe(true);
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
  });

  it('persists preference changes', () => {
    const service = TestBed.inject(ThemeService);

    service.toggle();

    expect(service.darkMode()).toBe(true);
    expect(localStorage.getItem(DARK_MODE_STORAGE_KEY)).toBe('true');
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);

    service.toggle();

    expect(service.darkMode()).toBe(false);
    expect(localStorage.getItem(DARK_MODE_STORAGE_KEY)).toBe('false');
    expect(document.documentElement.classList.contains('dark-theme')).toBe(false);
  });
});
