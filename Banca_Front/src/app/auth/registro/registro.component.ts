import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Inicializar formulario de registro
   */
  private initForm(): void {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  /**
   * Enviar formulario de registro
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userData = {
      nombre: this.registerForm.value.nombre,
      correo: this.registerForm.value.correo,
      contrasena: this.registerForm.value.contrasena
    };

    this.authService.registro(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Usuario registrado exitosamente. Redirigiendo al login...';

          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Error al registrar usuario';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error al registrar usuario';
        console.error('Error en registro:', error);
      }
    });
  }

  /**
   * Marcar todos los campos como tocados para mostrar validaciones
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verificar si un campo es inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtener mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }

    if (fieldName === 'nombre' && field?.hasError('minlength')) {
      return 'El nombre debe tener al menos 3 caracteres';
    }

    if (fieldName === 'correo' && field?.hasError('email')) {
      return 'Ingrese un correo electrónico válido';
    }

    if (fieldName === 'contrasena' && field?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }

    return '';
  }

  // Getters para acceso en template
  get nombre() {
    return this.registerForm.get('nombre');
  }

  get correo() {
    return this.registerForm.get('correo');
  }

  get contrasena() {
    return this.registerForm.get('contrasena');
  }
}
