import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  hidePassword = true;

  // Using signals for Angular 20
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.isLoading.set(false);

        if (response.success) {
          // Store token and user data
          localStorage.setItem('access_token', response?.data?.authToken);
          sessionStorage.setItem('user', JSON.stringify(response.data));

          // Navigate to main page
          this.router.navigate(['/main']);
        } else {
          this.errorMessage.set(response.message || 'Login failed. Please try again.');
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Login error:', error);

        // Handle different error scenarios
        if (error.status === 401) {
          this.errorMessage.set('Invalid email or password');
        } else if (error.status === 0) {
          this.errorMessage.set(
            'Unable to connect to server. Please check your internet connection.'
          );
        } else {
          this.errorMessage.set(error.error?.message || 'An error occurred. Please try again.');
        }
      },
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
