import { TestBed } from '@angular/core/testing';
import { DARK_MODE_STORAGE_PREFIX, ThemeService } from './theme.service';
import { UserService } from './user.service';

describe('ThemeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ThemeService, UserService] });
    localStorage.removeItem('user_data');
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(DARK_MODE_STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
    document.documentElement.classList.remove('dark-theme');
  });

  afterEach(() => {
    localStorage.removeItem('user_data');
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(DARK_MODE_STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
    document.documentElement.classList.remove('dark-theme');
  });

  it('restores the saved preference for the current user', () => {
    const userService = TestBed.inject(UserService);
    localStorage.setItem(`${DARK_MODE_STORAGE_PREFIX}user-1`, 'true');
    userService.setUser({
      id: 'user-1',
      firstName: 'First',
      lastName: 'User',
      email: 'first@example.com',
      phone: '',
      address: '',
      createdAt: '',
      updatedAt: '',
    });

    const service = TestBed.inject(ThemeService);

    expect(service.darkMode()).toBe(true);
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
  });

  it('persists preference changes separately for each user', () => {
    const userService = TestBed.inject(UserService);
    const user = (id: string) => ({
      id,
      firstName: 'Test',
      lastName: 'User',
      email: `${id}@example.com`,
      phone: '',
      address: '',
      createdAt: '',
      updatedAt: '',
    });
    userService.setUser(user('user-1'));
    const service = TestBed.inject(ThemeService);

    service.toggle();

    expect(service.darkMode()).toBe(true);
    expect(localStorage.getItem(`${DARK_MODE_STORAGE_PREFIX}user-1`)).toBe('true');
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);

    userService.setUser(user('user-2'));
    TestBed.tick();

    expect(service.darkMode()).toBe(false);
    expect(document.documentElement.classList.contains('dark-theme')).toBe(false);

    service.toggle();

    expect(service.darkMode()).toBe(true);
    expect(localStorage.getItem(`${DARK_MODE_STORAGE_PREFIX}user-2`)).toBe('true');

    userService.setUser(user('user-1'));
    TestBed.tick();

    expect(service.darkMode()).toBe(true);
    expect(localStorage.getItem(`${DARK_MODE_STORAGE_PREFIX}user-1`)).toBe('true');
  });
});
