import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        // Show a generic toast message on failure
        this.snackBar.open('Something went wrong. Please try again.', 'Close', {
          duration: 3000, // Toast duration in milliseconds
          //panelClass: ['error-snackbar'], // Optional: Add custom styling
        });

        return throwError(() => error); // Rethrow the error for further handling
      })
    );
  }
}
