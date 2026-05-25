import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ConfirmModalType = 'success' | 'error' | 'confirm';

@Component({
    selector: 'app-confirm-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="bb-modal-backdrop" *ngIf="visible" (click)="onBackdropClick()"></div>

    <div class="bb-modal" role="dialog" aria-modal="true" *ngIf="visible">
      <div class="bb-modal-header">
        <div class="bb-modal-title">
          <span *ngIf="type === 'success'" class="bb-badge bb-badge-success">✓</span>
          <span *ngIf="type === 'error'" class="bb-badge bb-badge-error">!</span>
          <span *ngIf="type === 'confirm'" class="bb-badge bb-badge-confirm">?</span>
          <span>{{ title }}</span>
        </div>
      </div>

      <div class="bb-modal-body">
        <p class="bb-modal-message">{{ message }}</p>
      </div>

      <div class="bb-modal-footer">
        <button
          *ngIf="showCancel"
          type="button"
          class="bb-btn bb-btn-secondary"
          (click)="onCancel()"
        >
          {{ cancelText }}
        </button>

        <button
          type="button"
          class="bb-btn bb-btn-primary"
          (click)="onConfirm()"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  `,
    styles: [`
    .bb-modal-backdrop{
      position:fixed; inset:0;
      background:rgba(0,0,0,.45);
      z-index:1000;
    }
    .bb-modal{
      position:fixed;
      left:50%; top:50%;
      transform:translate(-50%,-50%);
      background:#fff;
      border-radius:12px;
      width:min(520px, calc(100vw - 24px));
      z-index:1001;
      box-shadow:0 16px 50px rgba(0,0,0,.25);
      overflow:hidden;
    }
    .bb-modal-header{padding:16px 18px; border-bottom:1px solid #eee;}
    .bb-modal-title{display:flex; gap:10px; align-items:center; font-weight:700;}
    .bb-modal-body{padding:16px 18px;}
    .bb-modal-message{margin:0; color:#222; white-space:pre-wrap;}
    .bb-modal-footer{padding:14px 18px; display:flex; justify-content:flex-end; gap:10px; border-top:1px solid #eee;}

    .bb-badge{display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:999px; font-weight:800; color:#fff;}
    .bb-badge-success{background:#16a34a;}
    .bb-badge-error{background:#dc2626;}
    .bb-badge-confirm{background:#2563eb;}

    .bb-btn{border:none; border-radius:10px; padding:10px 14px; font-weight:600; cursor:pointer;}
    .bb-btn-primary{background:#2563eb; color:white;}
    .bb-btn-secondary{background:#f3f4f6; color:#111827;}
  `]
})
export class ConfirmModalComponent {
    @Input() visible = false;
    @Input() type: ConfirmModalType = 'success';
    @Input() title = '';
    @Input() message = '';

    @Input() confirmText = 'Aceptar';
    @Input() cancelText = 'Cancelar';
    @Input() showCancel = false;

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    onBackdropClick() {
        // Para no cerrar accidentalmente cuando showCancel=false (y el usuario espera confirmación)
        // Si se está usando como confirmación real (showCancel=true), sí permite cerrar por backdrop.
        if (this.showCancel) this.onCancel();
    }

    onConfirm() {
        this.confirm.emit();
    }

    onCancel() {
        this.cancel.emit();
    }
}

