import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  currentUser: any;
  isUserMenuOpen = false;

  constructor(private router: Router) {
    const userData = sessionStorage.getItem('user');
    this.currentUser = userData ? JSON.parse(userData) : { name: 'Guest User', email: '' };
  }

  ngOnInit() {
    // Check if user is logged in
    if (!sessionStorage.getItem('user')) {
      this.router.navigate(['/login']);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-section')) {
      this.isUserMenuOpen = false;
    }
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  navigateToProfile() {
    this.isUserMenuOpen = false;
    this.router.navigate(['/profile']);
  }

  logout() {
    sessionStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
