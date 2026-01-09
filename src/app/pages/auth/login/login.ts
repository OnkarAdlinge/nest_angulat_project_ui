import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      console.log('Login data:', this.loginForm.value);
      const user = {
        name: 'Onkar Adlinge',
        Mob: 7083554946,
        IsAdmin: true,
        email: 'onkar@test.com',
        userId: 1,
      };
      sessionStorage.setItem('user', JSON.stringify(user));
      this.isLoading = false;
      this.router.navigate(['/main']);
    }, 1500);
  }
}
