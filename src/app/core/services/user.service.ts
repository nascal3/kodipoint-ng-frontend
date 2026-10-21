import { computed, signal, Service} from '@angular/core';
import { User } from '../models/auth.interface';

@Service()
export class UserService {
  private readonly USER_KEY = 'user_data';
  private readonly userSignal = signal<User | null>(this.loadUserFromStorage());

  readonly user = this.userSignal.asReadonly();
  readonly userName = computed(() => {
    const user = this.userSignal();
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`;
  });
  readonly userEmail = computed(() => {
    const user = this.userSignal();
    if (!user) return '';
    return user.email;
  });
  readonly userInitials = computed(() => {
    const user = this.userSignal();
    if (!user) return '';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  });

  setUser(user: User): void {
    this.userSignal.set(user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  clearUser(): void {
    this.userSignal.set(null);
    localStorage.removeItem(this.USER_KEY);
  }

  private loadUserFromStorage(): User | null {
    const storedUser = localStorage.getItem(this.USER_KEY);
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser) as User;
    } catch {
      return null;
    }
  }
}
