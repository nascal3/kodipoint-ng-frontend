import { Injectable, signal, computed } from '@angular/core';
import zxcvbn from 'zxcvbn';
import type { ZXCVBNResult } from 'zxcvbn';

export type PasswordStrengthColor = 'primary' | 'accent' | 'warn' | 'primary';

@Injectable({
  providedIn: 'root'
})
export class PasswordStrengthService {
  // Writable signal for the password input
  readonly password = signal<string>('');

  // Computed result from zxcvbn
  readonly strengthResult = computed<ZXCVBNResult | null>(() => {
    const pwd = this.password();
    if (!pwd) return null;
    return zxcvbn(pwd);
  });

  // Score from 0 to 4
  readonly score = computed<number>(() => this.strengthResult()?.score ?? 0);

  // Percentage value for mat-progress-bar (0% to 100%)
  readonly progressValue = computed<number>(() => {
    const currentScore = this.score();
    // Map score 0-4 to 20%, 40%, 60%, 80%, 100%
    if (this.password() === '') return 0;
    return (currentScore + 1) * 20;
  });

  // Material color theme mapping based on score
  readonly progressColor = computed<string>(() => {
    const currentScore = this.score();
    if (currentScore <= 1) return '#ff4d4d'; // Red for Very Weak / Weak
    if (currentScore === 2) return '#ffa500'; // Orange for Fair
    if (currentScore === 3) return '#2196f3'; // Blue for Good
    return '#4caf50';                         // Green for Strong
  });

  // Text label mapping
  readonly scoreLabel = computed<string>(() => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[this.score()] || '';
  });

  // Feedback and warnings
  readonly feedback = computed(() => {
    return this.strengthResult()?.feedback ?? { warning: '', suggestions: [] };
  });

  // Helper method to update password state
  updatePassword(value: string) {
    this.password.set(value);
  }
}
