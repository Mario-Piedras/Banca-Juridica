import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ConfirmModalType = 'success' | 'error' | 'confirm';

@Component({
    selector: 'app-confirm-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './confirm-modal.component.html',
    styleUrls: ['./confirm-modal.component.css']
})
export class ConfirmModalComponent {
    @Input() visible = false;
    @Input() title = '';
    @Input() message = '';
    @Input() type: ConfirmModalType = 'success';
    @Input() confirmText = 'Aceptar';

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();
    @Output() closed = new EventEmitter<void>();

    onBackdropClick(): void {
        this.close();
    }

    onConfirm(): void {
        this.confirm.emit();
        this.close();
    }

    onCancel(): void {
        this.cancel.emit();
        this.close();
    }

    private close(): void {
        // Cerrar visual
        this.visible = false;
        this.closed.emit();
    }
}