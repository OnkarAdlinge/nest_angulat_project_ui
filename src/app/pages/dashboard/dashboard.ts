import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
}
@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  currentUser: any;
  isUserMenuOpen = false;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  sortColumn = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  users: User[] = [
    { id: 1, name: 'Onkar Adlinge', email: 'onkar@test.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'John Doe', email: 'john.doe@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'User', status: 'Active' },
    {
      id: 4,
      name: 'Mike Johnson',
      email: 'mike.j@example.com',
      role: 'Manager',
      status: 'Inactive',
    },
    { id: 5, name: 'Sarah Williams', email: 'sarah.w@example.com', role: 'User', status: 'Active' },
    { id: 6, name: 'David Brown', email: 'david.b@example.com', role: 'Manager', status: 'Active' },
    { id: 7, name: 'Emily Davis', email: 'emily.d@example.com', role: 'User', status: 'Active' },
    { id: 8, name: 'Chris Wilson', email: 'chris.w@example.com', role: 'User', status: 'Inactive' },
    {
      id: 9,
      name: 'Lisa Anderson',
      email: 'lisa.a@example.com',
      role: 'Manager',
      status: 'Active',
    },
    { id: 10, name: 'Tom Martinez', email: 'tom.m@example.com', role: 'User', status: 'Active' },
    { id: 11, name: 'Amy Taylor', email: 'amy.t@example.com', role: 'User', status: 'Active' },
    {
      id: 12,
      name: 'Robert Garcia',
      email: 'robert.g@example.com',
      role: 'Admin',
      status: 'Active',
    },
    {
      id: 13,
      name: 'Jennifer Lee',
      email: 'jennifer.l@example.com',
      role: 'User',
      status: 'Inactive',
    },
    {
      id: 14,
      name: 'Michael White',
      email: 'michael.w@example.com',
      role: 'Manager',
      status: 'Active',
    },
    {
      id: 15,
      name: 'Jessica Harris',
      email: 'jessica.h@example.com',
      role: 'User',
      status: 'Active',
    },
  ];

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

  onSearch() {
    this.currentPage = 1;
  }

  getFilteredUsers(): User[] {
    if (!this.searchTerm) {
      return this.getSortedUsers();
    }

    const term = this.searchTerm.toLowerCase();
    return this.getSortedUsers().filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
    );
  }

  getSortedUsers(): User[] {
    return [...this.users].sort((a, b) => {
      const aVal: any = a[this.sortColumn as keyof User];
      const bVal: any = b[this.sortColumn as keyof User];

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getPaginatedUsers(): User[] {
    const filtered = this.getFilteredUsers();
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return filtered.slice(start, end);
  }

  getTotalPages(): number {
    return Math.ceil(this.getFilteredUsers().length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  getEndIndex(): number {
    return Math.min(this.getStartIndex() + this.itemsPerPage, this.getFilteredUsers().length);
  }

  getTotalUsers(): number {
    return this.users.length;
  }

  getActiveUsers(): number {
    return this.users.filter((u) => u.status === 'Active').length;
  }
}
