import {inject, Injectable, signal, computed} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Observable} from 'rxjs';
import {UserProfileResponse, UpdateProfileRequest, ChangePasswordRequest} from '../models/settings.interface';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;
  readonly userProfile = signal<UserProfileResponse | null>(null);
  readonly isDetailsInvalid = computed(() => {
    const user = this.userProfile();
    const invalidPhoneNumber = !user?.phone || user.phone.trim() === '';
    const invalidAddress = !user?.address || user.address.trim() === '';

    return invalidAddress || invalidPhoneNumber;
  });

  loadUserProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.apiUrl}/users/me`);
  }

  updateProfile(data: UpdateProfileRequest): Observable<UserProfileResponse> {
    return this.http.patch<UserProfileResponse>(`${this.apiUrl}/users/me`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<UserProfileResponse> {
    return this.http.post<UserProfileResponse>(`${this.apiUrl}/users/me/change-password`, data);
  }
}
