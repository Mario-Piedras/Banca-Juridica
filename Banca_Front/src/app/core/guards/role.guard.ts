import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ============================
  // 1. VALIDAR TOKEN
  // ============================

  const isLogged = authService.isAuthenticated();

  if (!isLogged) {
    console.warn('⛔ No hay token, redirigiendo al login');
    router.navigate(['/auth/login']);
    return false;
  }

  // ============================
  // 2. VALIDAR QUE EXISTA USER
  // ============================

  const userRole = authService.getUserRole();

  if (!userRole) {
    console.warn('⚠ Usuario aún no cargado; permitimos acceso para evitar loop');
    return true; 
  }

  // ============================
  // 3. VALIDAR ROL REQUERIDO
  // ============================

  const requiredRole = route.data['role'];

  if (!requiredRole) {
    // Si no se especifica rol, solo verificar autenticación
    return true;
  }

  // Normalizar roles para comparación: minúsculas y separadores unificados
  const normalize = (val?: string | null) =>
    val?.toString().trim().toLowerCase().replace(/[_\s-]+/g, '-') || '';

  const normalizedUserRole = normalize(userRole);
  const normalizedRequiredRole = normalize(requiredRole);

  if (normalizedUserRole === normalizedRequiredRole) {
    return true; // correcto
  }

  // Si no tiene el rol, redirigir a página no autorizada o login
  console.warn(`⛔ Acceso denegado. Rol requerido: ${requiredRole}, Rol del usuario: ${userRole}`);
  router.navigate(['/auth/login']);
  return false;
};
// import { inject } from '@angular/core';
// import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
// import { AuthService } from '../services/auth.service';

// export const roleGuard: CanActivateFn = (
//   route: ActivatedRouteSnapshot,
//   state: RouterStateSnapshot
// ) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   // Verificar si el usuario está autenticado
//   if (!authService.isAuthenticated()) {
//     router.navigate(['/auth/login']);
//     return false;
//   }

//   // Obtener el rol requerido de la ruta
//   const requiredRole = route.data['role'];

//   if (!requiredRole) {
//     // Si no se especifica rol, solo verificar autenticación
//     return true;
//   }

//   // Verificar si el usuario tiene el rol requerido
//   const userRole = authService.getUserRole();

//   if (!userRole) {
//     console.warn('Usuario no tiene rol asignado');
//     router.navigate(['/auth/login']);
//     return false;
//   }

//   // Normalizar roles para comparación: minúsculas y separadores unificados
//   const normalize = (val?: string | null) =>
//     val?.toString().trim().toLowerCase().replace(/[_\s-]+/g, '-') || '';

//   const normalizedUserRole = normalize(userRole);
//   const normalizedRequiredRole = normalize(requiredRole);

//   if (normalizedUserRole === normalizedRequiredRole) {
//     return true;
//   }

//   // Si no tiene el rol, redirigir a página no autorizada o login
//   console.warn(`Acceso denegado. Rol requerido: ${requiredRole}, Rol del usuario: ${userRole}`);
//   router.navigate(['/auth/login']);
//   return false;
// };
