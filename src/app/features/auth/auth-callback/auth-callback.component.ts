import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthTokenService } from '@app/core/services/auth-token.service';
import { UserService } from '@app/core/services/user.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: '',
})
export class AuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authTokenService = inject(AuthTokenService);
  private readonly userService = inject(UserService);
  private isNewUser = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const accessToken = params['accessToken'] as string;
      const userData = params['user'] as string;

      if (accessToken) {
        this.authTokenService.setToken(accessToken);
      }

      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.isNewUser = user.newUser;
          this.userService.setUser(user);
        } catch {
          console.error('Failed to parse user data from callback');
        }
      }

      if (accessToken || userData) {
        if (this.isNewUser) {
          debugger;
          void this.router.navigate(['/settings']);
        } else {
          void this.router.navigate(['/dashboard']);
        }
      } else {
        void this.router.navigate(['/login']);
      }
    });
  }
}
