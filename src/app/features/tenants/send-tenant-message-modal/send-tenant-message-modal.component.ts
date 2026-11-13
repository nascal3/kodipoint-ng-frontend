import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  imports: [FormsModule, ...MATERIAL_MODULES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './send-tenant-message-modal.component.html',
  styleUrl: './send-tenant-message-modal.component.scss',
})
export class SendTenantMessageModalComponent {
  @Input({ required: true }) tenant!: TenantItem;
  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly sendRequested = new EventEmitter<TenantMessageDraft>();

  readonly sendSms = signal(true);
  readonly sendEmail = signal(true);
  readonly subject = signal('');
  readonly content = signal('');
  readonly formError = signal('');

  ngOnInit(): void {
    this.subject.set(`Tenant Notice - ${this.tenant.premises} ${this.tenant.unit}`);
    this.content.set(
      `Dear ${this.tenant.name},\n\nWe would like to share an important update regarding your tenancy at ${this.tenant.premises}, ${this.tenant.unit}. Please contact the property management team if you have any questions.\n\nThank you,\nKodiPoint`
    );
  }

  get smsSegments(): number {
    const length = this.content().length;
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
    this.subject.set(selectedTemplate.subject);
    this.content.set(selectedTemplate.content);
    this.formError.set('');
  }

  requestSend(): void {
    const content = this.content().trim();
    if (!this.sendSms() && !this.sendEmail()) {
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
        sms: this.sendSms(),
        email: this.sendEmail(),
      },
      subject: this.subject().trim(),
      content,
    });
  }
}
