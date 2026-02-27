import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq).pipe(
      catchError((error) => {
        if (error.status === 401) {
          console.warn('⚠️ Error 401 detectado - Token inválido o expirado');
          
          // Limpiar datos de sesión
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          
          // Redirigir al login solo si no es una ruta de auth
          if (!req.url.includes('/auth/')) {
            router.navigate(['/auth/login']);
          }
        }
        return throwError(() => error);
      })
    );
  }

  return next(req).pipe(
    catchError((error) => {
      return throwError(() => error);
    })
  );
};
// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { catchError } from 'rxjs/operators';
// import { throwError } from 'rxjs';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const router = inject(Router);

//   const token = localStorage.getItem('token');

//   if (token) {
//     const authReq = req.clone({
//       setHeaders: {
//         Authorization: `Bearer ${token}`
//       }
//     });

//     return next(authReq).pipe(
//       catchError((error) => {
//         if (error.status === 401) {
//           localStorage.removeItem('token');
//           localStorage.removeItem('currentUser');
//           router.navigate(['/auth/login']);
//         }
//         return throwError(() => error);
//       })
//     );
//   }

//   return next(req);
// };
