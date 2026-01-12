import { Component } from '@angular/core';
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
import { UserService } from '../../../services/user-service';

@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatNativeDateModule,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  profileForm!: FormGroup;
  isLoading = true;
  userData!: any;
  currentUser: any;

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    const userData = sessionStorage.getItem('user');
    this.currentUser = userData ? JSON.parse(userData) : { name: 'Guest User', email: '' };
    // initialize the FormGroup
    this.profileForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      birthDate: [''],
    });
    this.loadUser();
  }

  loadUser() {
    const id = this.currentUser.id ? this.currentUser.id : 0;
    this.userService.getUserProfileData(id).subscribe((res: any) => {
      if (res.success) {
        this.userData = res.data;
        this.profileForm.patchValue(res.data);
      }
      this.isLoading = false;
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) return;
    const updatedUser: any = { ...this.userData, ...this.profileForm.value };
    this.userService.updateUserProfileData(updatedUser).subscribe((res: any) => {
      if (res.success) {
        alert('Profile updated successfully!');
      }
    });
  }
}
