import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

// ========================================
// INTERFACES
// ========================================

export interface LoginRequest {
  correo: string;
  contrasena: string;
  rol: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id_usuario: number;
    correo: string;
    nombre: string;
    rol: string;
    id_usuario_rol?: number;
    id_caja?: number;           // ← NUEVO: Para cajeros
    nombre_caja?: string;       // ← NUEVO: Para cajeros
  };
}

export interface RegistroRequest {
  nombre: string;
  correo: string;
  contrasena: string;
}

export interface RegistroResponse {
  success: boolean;
  message: string;
  data?: {
    id_usuario: number;
    nombre: string;
    correo: string;
    fecha_creacion: Date;
    activo: boolean;
  };
}

export interface User {
  id_usuario: number;
  correo: string;
  nombre: string;
  rol: string;
  id_usuario_rol?: number;
  id_caja?: number;            // ← NUEVO: Para cajeros
  nombre_caja?: string;        // ← NUEVO: Para cajeros
}

export interface Rol {
  id_rol: number;
  nombre: string;
  descripcion?: string;
}

export interface RolesResponse {
  success: boolean;
  roles: Rol[];
}

// ========================================
// SERVICIO DE AUTENTICACIÓN
// ========================================

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Buscar en ambos lugares para compatibilidad
    const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // ========================================
  // AUTENTICACIÓN
  // ========================================

  /**
   * Login de usuario
   * Decodifica el token JWT para extraer la información del usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            console.log('✅ Login exitoso, guardando token...');

            // Guardar token
            localStorage.setItem('token', response.token);

            // Decodificar el token para extraer el usuario
            try {
              const payload = JSON.parse(atob(response.token.split('.')[1]));
              const user: User = {
                id_usuario: payload.id_usuario,
                correo: payload.correo,
                nombre: payload.nombre,
                rol: payload.rol,
                id_usuario_rol: payload.id_usuario_rol,
                // ✅ AGREGAR LOS CAMPOS DE CAJA DEL PAYLOAD
                id_caja: payload.id_caja,
                nombre_caja: payload.nombre_caja
              };

              // Guardar usuario en AMBOS lugares para compatibilidad
              localStorage.setItem('currentUser', JSON.stringify(user));
              localStorage.setItem('user', JSON.stringify(user));
              
              this.currentUserSubject.next(user);

              console.log('✅ Token y usuario guardados correctamente');
              console.log('Usuario con caja:', user);
            } catch (error) {
              console.error('❌ Error al decodificar token:', error);
            }
          }
        })
      );
  }

  /**
   * Registro de usuario
   */
  registro(datos: RegistroRequest): Observable<RegistroResponse> {
    return this.http.post<RegistroResponse>(`${this.apiUrl}/registro`, datos);
  }

  /**
   * Cerrar sesión con liberación de caja para cajeros
   */
  logout(): void {
    const currentUser = this.currentUserValue;
    const id_usuario = currentUser?.id_usuario;

    // Liberar caja en el backend si es cajero
    if (id_usuario) {
      this.http.post(`${this.apiUrl}/logout`, { id_usuario }).subscribe({
        next: () => console.log('✅ Caja liberada en el backend'),
        error: (error) => console.error('❌ Error al liberar caja:', error)
      });
    }

    // Limpiar frontend
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  // ========================================
  // GESTIÓN DE ROLES
  // ========================================

  /**
   * Obtener todos los roles del sistema
   */
  getRolesDelSistema(): Observable<RolesResponse> {
    return this.http.get<RolesResponse>(`${this.apiUrl}/roles`);
  }

  /**
   * Obtener roles disponibles para un usuario específico
   */
  getRolesDisponibles(correo: string): Observable<RolesResponse> {
    return this.http.get<RolesResponse>(`${this.apiUrl}/roles-disponibles`, {
      params: { correo }
    });
  }

  /**
   * Asignar un rol a un usuario
   */
  asignarRol(correo: string, rol: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/asignar-rol`,
      { correo, rol }
    );
  }

  /**
   * Verificar si un usuario tiene un rol específico
   */
  verificarRol(correo: string, rol: string): Observable<{ success: boolean; tieneRol: boolean }> {
    return this.http.get<{ success: boolean; tieneRol: boolean }>(
      `${this.apiUrl}/verificar-rol`,
      { params: { correo, rol } }
    );
  }

  // ========================================
  // VALIDACIONES
  // ========================================

  /**
   * Validar si un correo ya existe
   */
  validarEmail(correo: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/validar-email`, {
      params: { correo }
    });
  }

  // ========================================
  // UTILIDADES
  // ========================================

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  /**
   * Obtener token JWT
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Obtener rol del usuario actual
   */
  getUserRole(): string | null {
    const user = this.currentUserValue;
    return user ? user.rol : null;
  }

  /**
   * Obtener información de caja del usuario actual (para cajeros)
   */
  getUserCaja(): { id_caja?: number; nombre_caja?: string } {
    const user = this.currentUserValue;
    return {
      id_caja: user?.id_caja,
      nombre_caja: user?.nombre_caja
    };
  }

  /**
   * Verificar si el usuario tiene un rol específico
   * Normaliza los roles para comparación (minúsculas y guiones)
   */
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    if (!userRole) return false;

    // Normalizar roles: minúsculas y separadores unificados
    const normalize = (val: string) => val.toLowerCase().trim().replace(/[_\s-]+/g, '-');
    return normalize(userRole) === normalize(role);
  }

  /**
   * Verificar si el usuario es cajero y tiene caja asignada
   */
  isCajeroConCaja(): boolean {
    const user = this.currentUserValue;
    return this.hasRole('cajero') && !!user?.id_caja;
  }

  /**
   * Método para agregar el token a las peticiones HTTP
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
}

// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable, BehaviorSubject, tap } from 'rxjs';
// import { Router } from '@angular/router';
// import { environment } from '../../../environments/environment';

// // ========================================
// // INTERFACES
// // ========================================

// export interface LoginRequest {
//   correo: string;
//   contrasena: string;
//   rol: string;
// }

// export interface LoginResponse {
//   success: boolean;
//   message: string;
//   token?: string;
//   user?: {
//     id_usuario: number;
//     correo: string;
//     nombre: string;
//     rol: string;
//     id_usuario_rol?: number;
//   };
// }

// export interface RegistroRequest {
//   nombre: string;
//   correo: string;
//   contrasena: string;
// }

// export interface RegistroResponse {
//   success: boolean;
//   message: string;
//   data?: {
//     id_usuario: number;
//     nombre: string;
//     correo: string;
//     fecha_creacion: Date;
//     activo: boolean;
//   };
// }

// export interface User {
//   id_usuario: number;
//   correo: string;
//   nombre: string;
//   rol: string;
//   id_usuario_rol?: number;
// }

// export interface Rol {
//   id_rol: number;
//   nombre: string;
//   descripcion?: string;
// }

// export interface RolesResponse {
//   success: boolean;
//   roles: Rol[];
// }

// // ========================================
// // SERVICIO DE AUTENTICACIÓN
// // ========================================

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private apiUrl = `${environment.apiUrl}/auth`;

//   private currentUserSubject: BehaviorSubject<User | null>;
//   public currentUser: Observable<User | null>;

//   constructor(
//     private http: HttpClient,
//     private router: Router
//   ) {
//     // Buscar en ambos lugares para compatibilidad
//     const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
//     this.currentUserSubject = new BehaviorSubject<User | null>(
//       storedUser ? JSON.parse(storedUser) : null
//     );
//     this.currentUser = this.currentUserSubject.asObservable();
//   }

//   public get currentUserValue(): User | null {
//     return this.currentUserSubject.value;
//   }

//   // ========================================
//   // AUTENTICACIÓN
//   // ========================================

//   /**
//    * Login de usuario
//    * Decodifica el token JWT para extraer la información del usuario
//    */
//   login(credentials: LoginRequest): Observable<LoginResponse> {
//     return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
//       .pipe(
//         tap(response => {
//           if (response.success && response.token) {
//             console.log('✅ Login exitoso, guardando token...');

//             // Guardar token
//             localStorage.setItem('token', response.token);

//             // Decodificar el token para extraer el usuario
//             try {
//               const payload = JSON.parse(atob(response.token.split('.')[1]));
//               const user: User = {
//                 id_usuario: payload.id_usuario,
//                 correo: payload.correo,
//                 nombre: payload.nombre,
//                 rol: payload.rol,
//                 id_usuario_rol: payload.id_usuario_rol
//               };

//               // Guardar usuario en AMBOS lugares para compatibilidad
//               localStorage.setItem('currentUser', JSON.stringify(user));
//               localStorage.setItem('user', JSON.stringify(user));
              
//               this.currentUserSubject.next(user);

//               console.log('✅ Token y usuario guardados correctamente');
//               console.log('Usuario:', user);
//             } catch (error) {
//               console.error('❌ Error al decodificar token:', error);
//             }
//           }
//         })
//       );
//   }

//   /**
//    * Registro de usuario
//    */
//   registro(datos: RegistroRequest): Observable<RegistroResponse> {
//     return this.http.post<RegistroResponse>(`${this.apiUrl}/registro`, datos);
//   }

//   /**
//    * Cerrar sesión
//    */
//   logout(): void {
//     // Remover todos los datos de autenticación
//     localStorage.removeItem('token');
//     localStorage.removeItem('currentUser');
//     localStorage.removeItem('user');
//     this.currentUserSubject.next(null);
//     this.router.navigate(['/auth/login']);
//   }

//   // ========================================
//   // GESTIÓN DE ROLES
//   // ========================================

//   /**
//    * Obtener todos los roles del sistema
//    */
//   getRolesDelSistema(): Observable<RolesResponse> {
//     return this.http.get<RolesResponse>(`${this.apiUrl}/roles`);
//   }

//   /**
//    * Obtener roles disponibles para un usuario específico
//    */
//   getRolesDisponibles(correo: string): Observable<RolesResponse> {
//     return this.http.get<RolesResponse>(`${this.apiUrl}/roles-disponibles`, {
//       params: { correo }
//     });
//   }

//   /**
//    * Asignar un rol a un usuario
//    */
//   asignarRol(correo: string, rol: string): Observable<{ success: boolean; message: string }> {
//     return this.http.post<{ success: boolean; message: string }>(
//       `${this.apiUrl}/asignar-rol`,
//       { correo, rol }
//     );
//   }

//   /**
//    * Verificar si un usuario tiene un rol específico
//    */
//   verificarRol(correo: string, rol: string): Observable<{ success: boolean; tieneRol: boolean }> {
//     return this.http.get<{ success: boolean; tieneRol: boolean }>(
//       `${this.apiUrl}/verificar-rol`,
//       { params: { correo, rol } }
//     );
//   }

//   // ========================================
//   // VALIDACIONES
//   // ========================================

//   /**
//    * Validar si un correo ya existe
//    */
//   validarEmail(correo: string): Observable<{ exists: boolean }> {
//     return this.http.get<{ exists: boolean }>(`${this.apiUrl}/validar-email`, {
//       params: { correo }
//     });
//   }

//   // ========================================
//   // UTILIDADES
//   // ========================================

//   /**
//    * Verificar si el usuario está autenticado
//    */
//   isAuthenticated(): boolean {
//     const token = localStorage.getItem('token');
//     return !!token;
//   }

//   /**
//    * Obtener token JWT
//    */
//   getToken(): string | null {
//     return localStorage.getItem('token');
//   }

//   /**
//    * Obtener rol del usuario actual
//    */
//   getUserRole(): string | null {
//     const user = this.currentUserValue;
//     return user ? user.rol : null;
//   }

//   /**
//    * Verificar si el usuario tiene un rol específico
//    * Normaliza los roles para comparación (minúsculas y guiones)
//    */
//   hasRole(role: string): boolean {
//     const userRole = this.getUserRole();
//     if (!userRole) return false;

//     // Normalizar roles: minúsculas y separadores unificados
//     const normalize = (val: string) => val.toLowerCase().trim().replace(/[_\s-]+/g, '-');
//     return normalize(userRole) === normalize(role);
//   }

//   /**
//    * Método para agregar el token a las peticiones HTTP
//    */
//   getAuthHeaders(): HttpHeaders {
//     const token = this.getToken();
//     return new HttpHeaders({
//       'Content-Type': 'application/json',
//       'Authorization': token ? `Bearer ${token}` : ''
//     });
//   }
// }
