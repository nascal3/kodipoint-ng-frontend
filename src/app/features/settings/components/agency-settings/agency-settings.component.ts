import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

class AgencyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: AbstractControl | null,
    form: FormGroupDirective | NgForm | null,
  ): boolean {
    const isSubmitted = form?.submitted ?? false;
    return !!control && control.invalid && (control.touched || isSubmitted);
  }
}

@Component({
  selector: 'app-agency-settings',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './agency-settings.component.html',
  styleUrl: './agency-settings.component.scss',
})
export class AgencySettingsComponent {
  readonly submitted = signal(false);
  readonly agencyErrorStateMatcher = new AgencyErrorStateMatcher();
  readonly agencyForm = new FormGroup({
    address: new FormControl('P.O Box 12345 00400 Kiambu, Nairobi', {
      nonNullable: true
    }),
    email: new FormControl('billing@enterprise.ke', {
      nonNullable: true,
      validators: [Validators.email],
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
