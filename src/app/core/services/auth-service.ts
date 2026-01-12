import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Define interfaces for type safety
export interface LoginRequest {
  email: string;
  password: string;
}

// export interface LoginResponse {
//   success: boolean;
//   token: string;
//   user: {
//     id: number;
//     name: string;
//     email: string;
//     Mob?: number;
//     IsAdmin?: boolean;
//   };
//   message?: string;
// }

export interface User {
  id: number;
  name: string;
  email: string;
  Mob?: number;
  IsAdmin?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Replace with your actual API URL
  private apiUrl = environment.apiUrl;

  // BehaviorSubject to track authentication state
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // BehaviorSubject to track current user
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Login method - sends credentials to API
   */
  login(email: string, password: string): Observable<any> {
    const loginData: LoginRequest = { email, password };

    return this.http.post<any>(`${this.apiUrl}/users/login`, loginData).pipe(
      tap((response) => {
        if (response.success && response.token) {
          // Update authentication state
          this.isAuthenticatedSubject.next(true);
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError((error) => {
        console.error('Login failed:', error);
        throw error;
      })
    );
  }

  /**
   * Logout method - clears tokens and navigates to login
   */
  logout(): void {
    // Clear all stored data
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('user');

    // Update authentication state
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);

    // Navigate to login page
    this.router.navigate(['/login']);
  }

  /**
   * Get the stored access token
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Check if user has a valid token
   */
  hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  /**
   * Get current user from session storage
   */
  getCurrentUser(): User | null {
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * Get HTTP headers with authorization token
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Refresh token method (if your API supports it)
   */
  refreshToken(): Observable<any> {
    const token = this.getToken();
    return this.http.post(`${this.apiUrl}/auth/refresh`, { token }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('access_token', response.token);
        }
      })
    );
  }

  /**
   * Verify if the current token is still valid
   */
  verifyToken(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/auth/verify`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          if (error.status === 401) {
            this.logout();
          }
          throw error;
        })
      );
  }
}
