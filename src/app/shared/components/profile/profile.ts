import { Component, signal, computed } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../../services/user-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    CommonModule,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  profileForm!: FormGroup;

  // Using signals for reactive state management (Angular 20)
  isLoading = signal(true);
  isSaving = signal(false);
  formChanged = signal(false);
  userData = signal<any>(null);
  currentUser = signal<any>(null);
  avatarUrl = signal('');

  // Computed values that update automatically
  fullName = computed(() => {
    const firstName = this.profileForm?.get('firstName')?.value || '';
    const lastName = this.profileForm?.get('lastName')?.value || '';
    return `${firstName} ${lastName}`.trim() || 'User';
  });

  userEmail = computed(() => {
    return this.profileForm?.get('email')?.value || 'email@example.com';
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    // Initialize avatar URL with default
    this.avatarUrl.set(this.getDefaultAvatar());
  }

  ngOnInit(): void {
    const userDataStr = sessionStorage.getItem('user');
    const parsedUser = userDataStr ? JSON.parse(userDataStr) : { name: 'Guest User', email: '' };
    this.currentUser.set(parsedUser);

    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', Validators.required],
    });

    // Track form changes
    this.profileForm.valueChanges.subscribe(() => {
      this.formChanged.set(true);
      // Update avatar URL when name changes
      const firstName = this.profileForm.get('firstName')?.value || '';
      const lastName = this.profileForm.get('lastName')?.value || '';
      if (firstName || lastName) {
        this.avatarUrl.set(this.getAvatarUrlFromNames(firstName, lastName));
      }
    });

    this.loadUser();
  }

  loadUser() {
    const id = this.currentUser()?.id || 0;
    this.userService.getUserProfileData(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.userData.set(res.data);
          this.profileForm.patchValue(res.data, { emitEvent: false });
          this.avatarUrl.set(this.getAvatarUrlFromNames(res.data.firstName, res.data.lastName));
          this.formChanged.set(false);
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.showSnackBar('Failed to load profile data', 'error');
      },
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      this.showSnackBar('Please fill in all required fields correctly', 'error');
      return;
    }

    this.isSaving.set(true);

    // Only send the fields that can be updated
    const updatePayload = {
      id: this.userData()?.id || this.currentUser()?.id,
      firstName: this.profileForm.get('firstName')?.value,
      lastName: this.profileForm.get('lastName')?.value,
      email: this.profileForm.get('email')?.value,
      birthDate: this.profileForm.get('birthDate')?.value,
    };

    this.userService.updateUserProfileData(updatePayload).subscribe({
      next: (res: any) => {
        this.isSaving.set(false);
        if (res.success) {
          // Merge the updated fields with existing user data
          const updatedUser = {
            ...this.userData(),
            firstName: updatePayload.firstName,
            lastName: updatePayload.lastName,
            email: updatePayload.email,
            birthDate: updatePayload.birthDate,
          };
          this.userData.set(updatedUser);

          // Update session storage with new data
          const currentSessionUser = sessionStorage.getItem('user');
          if (currentSessionUser) {
            const sessionUser = JSON.parse(currentSessionUser);
            sessionUser.firstName = updatePayload.firstName;
            sessionUser.lastName = updatePayload.lastName;
            sessionUser.email = updatePayload.email;
            sessionUser.birthDate = updatePayload.birthDate;
            sessionStorage.setItem('user', JSON.stringify(sessionUser));
          }

          this.showSnackBar('Profile updated successfully! ✓', 'success');
          this.formChanged.set(false);
        }
      },
      error: (err: any) => {
        this.isSaving.set(false);
        this.showSnackBar('Failed to update profile. Please try again.', 'error');
      },
    });
  }

  resetForm() {
    if (this.userData()) {
      this.profileForm.patchValue(this.userData(), { emitEvent: false });
      const data = this.userData();
      this.avatarUrl.set(this.getAvatarUrlFromNames(data.firstName, data.lastName));
      this.formChanged.set(false);
      this.showSnackBar('Changes discarded', 'info');
    }
  }

  getAvatarUrlFromNames(firstName: string, lastName: string): string {
    const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
    if (!initials.trim()) {
      return this.getDefaultAvatar();
    }
    return `https://ui-avatars.com/api/?name=${initials}&background=6366f1&color=fff&size=200&bold=true`;
  }

  getDefaultAvatar(): string {
    return `https://ui-avatars.com/api/?name=U&background=6366f1&color=fff&size=200&bold=true`;
  }

  showSnackBar(message: string, type: 'success' | 'error' | 'info') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`],
    });
  }

  getErrorMessage(field: string): string {
    const control = this.profileForm.get(field);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (control?.hasError('minlength')) {
      return 'Minimum 2 characters required';
    }
    return '';
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
