import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../../environments/environment';
import { AuthTokenService } from '../../../core/services/auth-token.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let httpTestingController: HttpTestingController;
  let authTokenService: AuthTokenService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    httpTestingController = TestBed.inject(HttpTestingController);
    authTokenService = TestBed.inject(AuthTokenService);
    router = TestBed.inject(Router);
    authTokenService.removeToken();
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
    authTokenService.removeToken();
  });

  it('posts credentials, stores the access token, and navigates to the dashboard', () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const component = fixture.componentInstance;
    component.loginForm.setValue({ email: 'manager@example.com', password: 'StrongPassword123!' });

    component.onSubmit();

    const request = httpTestingController.expectOne(`${environment.apiUrl}/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'manager@example.com',
      password: 'StrongPassword123!',
    });

    request.flush({ accessToken: 'test-access-token' });

    expect(authTokenService.getToken()).toBe('test-access-token');
    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('shows the backend message when login fails', () => {
    const component = fixture.componentInstance;
    component.loginForm.setValue({ email: 'manager@example.com', password: 'wrong-password' });

    component.onSubmit();
    httpTestingController.expectOne(`${environment.apiUrl}/auth/login`).flush(
      {
        success: false,
        statusCode: 401,
        message: 'Invalid email or password',
        error: 'Unauthorized',
        details: 'Invalid email or password',
      },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(component.signInMessage()).toBe('Invalid email or password');
  });
});
