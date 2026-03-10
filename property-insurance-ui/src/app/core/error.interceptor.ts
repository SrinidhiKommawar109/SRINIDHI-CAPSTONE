import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // Allow 400s (validation errors) to be handled by the component if needed,
            // but the task asks to display backend errors in the error page globally.
            if (error.status === 401) {
                // Let auth guard/interceptor handle 401s (usually redirecting to login)
            } else if (error.status === 400) {
                // Allow 400s (validation errors) to be handled by the component
            } else {
                router.navigate(['/error'], {
                    state: {
                        error: error.error || error,
                        status: error.status
                    }
                });
            }
            return throwError(() => error);
        })
    );
};
