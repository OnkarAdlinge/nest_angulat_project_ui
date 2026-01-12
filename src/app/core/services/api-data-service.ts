import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth-service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiDataService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  // 💡 You can move this to environment later
  private baseUrl = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // ---------- HTTP METHODS ----------

  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}/${endpoint}`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}/${endpoint}`, body, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}/${endpoint}`, body, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}/${endpoint}`, body, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}/${endpoint}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // ---------- ERROR HANDLER ----------

  private handleError(error: any) {
    // If interceptor exists, it will ALSO run
    // You can add logging/toast etc. here if you want

    if (error?.error?.message) {
      console.error('API Error:', error.error.message);
    } else {
      console.error('Unexpected Error:', error);
    }

    return throwError(() => error);
  }
}
