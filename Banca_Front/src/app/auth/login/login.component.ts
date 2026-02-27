import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, Rol } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  rolesDisponibles: Rol[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    // Verificar si ya está autenticado
    if (this.authService.isAuthenticated()) {
      this.redirectToRolePage();
    }

    // Cargar todos los roles disponibles del sistema
    this.cargarRolesDelSistema();
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
      rol: ['', Validators.required]
    });
  }

  get correo() {
    return this.loginForm.get('correo');
  }

  get contrasena() {
    return this.loginForm.get('contrasena');
  }

  get rol() {
    return this.loginForm.get('rol');
  }

  /**
   * Cargar todos los roles del sistema para mostrarlos en el select
   */
  cargarRolesDelSistema(): void {
    this.authService.getRolesDelSistema().subscribe({
      next: (response) => {
        if (response.success) {
          this.rolesDisponibles = response.roles;
        }
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        // Si falla, usar roles por defecto (solo los 4 roles válidos del sistema)
        this.rolesDisponibles = [
          { id_rol: 2, nombre: 'Asesor', descripcion: 'Gestión de solicitudes' },
          { id_rol: 3, nombre: 'Cajero', descripcion: 'Operaciones de caja' },
          { id_rol: 4, nombre: 'Director-operativo', descripcion: 'Aprobación de solicitudes'},
          { id_rol: 5, nombre: 'Cajero-Principal', descripcion: 'Supervisor de cajeros y saldos' }
        ];
      }
    });
  }

  /**
   * Enviar formulario de login
   * El backend asignará automáticamente el rol si no lo tiene
   */
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;

    const loginData = {
      correo: this.loginForm.value.correo,
      contrasena: this.loginForm.value.contrasena,
      rol: this.loginForm.value.rol
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = '¡Inicio de sesión exitoso!';
          this.isLoading = false;

          // Redirigir inmediatamente a la página del rol
          setTimeout(() => {
            this.redirectToRolePage();
          }, 500);
        } else {
          this.isLoading = false;
          this.errorMessage = response.message || 'Error al iniciar sesión';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        console.error('Error de login:', error);
      }
    });
  }

  /**
   * Redirigir a la página según el rol seleccionado
   * ✅ USANDO router.navigate EN LUGAR DE window.location.href
   */
  redirectToRolePage(): void {
    const userRole = this.authService.getUserRole();

    // Normalizar para evitar problemas de mayúsculas/minúsculas o separadores
    const normalizedRole = (userRole || '').toString().trim().toLowerCase();

    const routeMap: Record<string, string> = {
      // Asesor
      'asesor': '/asesor',
      // Cajero
      'cajero': '/cajero',
      // Cajero principal
      'cajero-principal': '/cajero-principal',
      'cajero principal': '/cajero-principal',
      // Director operativo (variantes comunes)
      'director-operativo': '/director-operativo',
      'director operativo': '/director-operativo',
      'director_operativo': '/director-operativo'
    };

    const targetRoute = routeMap[normalizedRole];

    if (targetRoute) {
      console.log('🔄 Redirigiendo a:', targetRoute);
      // ✅ USAR router.navigate EN LUGAR DE window.location.href
      this.router.navigate([targetRoute]);
    } else {
      console.warn(`❌ Rol no reconocido: ${userRole}`);
      this.router.navigate(['/auth/login']);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
