import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MATERIAL_MODULES } from '@app/shared/material.imports';
import { TenantItem } from '../models/tenants.interface';

export interface TenantMessageDraft {
  tenantId: string;
  recipient: {
    name: string;
    email: string;
    phone: string;
  };
  channels: {
    sms: boolean;
    email: boolean;
  };
  subject: string;
  content: string;
}

@Component({
  selector: 'app-send-tenant-message-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ...MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './send-tenant-message-modal.component.html',
  styleUrl: './send-tenant-message-modal.component.scss',
})
export class SendTenantMessageModalComponent {
  @Input({ required: true }) tenant!: TenantItem;
  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly sendRequested = new EventEmitter<TenantMessageDraft>();

  readonly formError = signal('');
  readonly messageForm = new FormGroup({
    sendSms: new FormControl(true, { nonNullable: true }),
    sendEmail: new FormControl(true, { nonNullable: true }),
    subject: new FormControl('', { nonNullable: true }),
    content: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit(): void {
    this.messageForm.patchValue({
      subject: `Tenant Notice - ${this.tenant.premises} ${this.tenant.unit}`,
      content: `Dear ${this.tenant.name},\n\nWe would like to share an important update regarding your tenancy at ${this.tenant.premises}, ${this.tenant.unit}. Please contact the property management team if you have any questions.\n\nThank you,\nKodiPoint`,
    });
  }

  get smsSegments(): number {
    const length = this.messageForm.controls.content.value.length;
    return length <= 160 ? 1 : Math.ceil(length / 153);
  }

  close(): void {
    this.closed.emit();
  }

  insertTemplate(template: 'payment' | 'maintenance' | 'receipt'): void {
    const templates = {
      payment: {
        subject: `Payment Reminder - ${this.tenant.premises} ${this.tenant.unit}`,
        content: `Dear ${this.tenant.name},\n\nThis is a friendly reminder regarding your rent payment for ${this.tenant.unit} at ${this.tenant.premises}. Please contact us if you have already made your payment.\n\nThank you,\nKodiPoint`,
      },
      maintenance: {
        subject: `Maintenance Notice - ${this.tenant.premises} ${this.tenant.unit}`,
        content: `Dear ${this.tenant.name},\n\nPlease be advised of scheduled maintenance at ${this.tenant.premises}. We will share any further details with you as they become available.\n\nThank you,\nKodiPoint`,
      },
      receipt: {
        subject: `Receipt Notification - ${this.tenant.premises} ${this.tenant.unit}`,
        content: `Dear ${this.tenant.name},\n\nYour payment has been received. Thank you for your payment. Please contact the property management team if you need a copy of your receipt.\n\nThank you,\nKodiPoint`,
      },
    } as const;
    const selectedTemplate = templates[template];
    this.messageForm.patchValue(selectedTemplate);
    this.formError.set('');
  }

  requestSend(): void {
    const { sendSms, sendEmail, subject, content: rawContent } = this.messageForm.getRawValue();
    const content = rawContent.trim();
    if (!sendSms && !sendEmail) {
      this.formError.set('Select at least one delivery channel.');
      return;
    }
    if (!content) {
      this.formError.set('Message content is required.');
      return;
    }

    this.sendRequested.emit({
      tenantId: this.tenant.id,
      recipient: {
        name: this.tenant.name,
        email: this.tenant.email,
        phone: this.tenant.phone,
      },
      channels: {
        sms: sendSms,
        email: sendEmail,
      },
      subject: subject.trim(),
      content,
    });
  }
}
