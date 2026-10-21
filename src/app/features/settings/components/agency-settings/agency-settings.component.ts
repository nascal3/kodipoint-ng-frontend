import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-agency-settings',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './agency-settings.component.html',
  styleUrl: './agency-settings.component.scss',
})
export class AgencySettingsComponent {
  readonly submitted = signal(false);
  readonly agencyForm = new FormGroup({
    address: new FormControl('P.O Box 12345 00400 Kiambu, Nairobi', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('billing@enterprise.ke', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  validateAgency(): void {
    this.submitted.set(true);
    this.agencyForm.markAllAsTouched();
  }

  showError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.submitted());
  }
}
