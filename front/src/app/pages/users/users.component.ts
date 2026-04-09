import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AppUser, LoginPayload, UserPayload, UserRole, USER_ROLES } from '../../models/user.model';
import { UsersService } from '../../services/users.service';

type UserSortField = 'id' | 'username' | 'email' | 'role' | 'created_at' | 'enabled';
type SortDirection = 'asc' | 'desc';
type AuthMode = 'sign-in' | 'sign-up';

interface UserFormValue {
  id?: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: UserRole;
  enabled: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  created_at: string;
}

interface SignInFormValue {
  identifier: string;
  password: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  providers: [DatePipe],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  readonly roles = USER_ROLES;
  readonly sessionStorageKey = 'freelink-user-session';

  users: AppUser[] = [];
  currentUser: AppUser | null = null;

  authMode: AuthMode = 'sign-in';
  signInData: SignInFormValue = this.createEmptySignIn();
  signUpData: UserFormValue = this.createEmptyUser('CLIENT');

  searchTerm = '';
  sortField: UserSortField = 'created_at';
  sortDirection: SortDirection = 'desc';
  page = 1;
  readonly pageSize = 4;
  isDarkMode = true;

  loading = false;
  saving = false;
  authenticating = false;
  deletingId?: number;
  errorMessage = '';
  successMessage = '';

  isFormOpen = false;
  isEditMode = false;
  formSubmitted = false;
  signInSubmitted = false;
  signUpSubmitted = false;
  formUser: UserFormValue = this.createEmptyUser();

  constructor(
    private readonly usersService: UsersService,
    private readonly datePipe: DatePipe,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.restoreThemePreference();
    this.restoreSession();

    if (this.isAuthenticated) {
      this.loadUsers();
    }
  }

  get isAuthenticated(): boolean {
    return Boolean(this.currentUser);
  }

  get canManageDirectory(): boolean {
    return Boolean(this.currentUser?.is_superuser || this.currentUser?.role === 'ADMIN');
  }

  get isCurrentUserFreelancer(): boolean {
    return this.currentUser?.role === 'FREELANCER';
  }

  get filteredUsers(): AppUser[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.users;
    }

    return this.users.filter((user) =>
      [
        user.id,
        user.username,
        user.first_name,
        user.last_name,
        user.email,
        user.role,
        user.enabled ? 'enabled' : 'disabled'
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }

  get sortedUsers(): AppUser[] {
    const direction = this.sortDirection === 'asc' ? 1 : -1;

    return [...this.filteredUsers].sort((a, b) => {
      const left = this.getSortValue(a);
      const right = this.getSortValue(b);

      if (left < right) {
        return -1 * direction;
      }

      if (left > right) {
        return 1 * direction;
      }

      return 0;
    });
  }

  get pagedUsers(): AppUser[] {
    const start = (this.page - 1) * this.pageSize;
    return this.sortedUsers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.sortedUsers.length / this.pageSize));
  }

  get totalUsersLabel(): string {
    return `${this.filteredUsers.length} user${this.filteredUsers.length === 1 ? '' : 's'}`;
  }

  get totalUsers(): number {
    return this.users.length;
  }

  get enabledUsers(): number {
    return this.users.filter((user) => user.enabled).length;
  }

  get freelancerUsers(): number {
    return this.users.filter((user) => user.role === 'FREELANCER').length;
  }

  get adminUsers(): number {
    return this.users.filter((user) => user.role === 'ADMIN' || user.is_superuser).length;
  }

  setAuthMode(mode: AuthMode): void {
    this.authMode = mode;
    this.errorMessage = '';
    this.successMessage = '';
    this.signInSubmitted = false;
    this.signUpSubmitted = false;

    if (mode === 'sign-up') {
      this.signUpData = this.createEmptyUser('CLIENT');
    }
  }

  signIn(signInForm: NgForm): void {
    this.signInSubmitted = true;

    if (signInForm.invalid) {
      signInForm.control.markAllAsTouched();
      return;
    }

    this.authenticating = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: LoginPayload = {
      identifier: this.signInData.identifier.trim(),
      password: this.signInData.password
    };

    this.usersService.login(payload)
      .pipe(finalize(() => {
        this.authenticating = false;
      }))
      .subscribe({
        next: (response) => {
          this.applySession(response.user);
          this.successMessage = `Welcome back, ${this.displayNameFor(response.user)}.`;
          this.signInSubmitted = false;
          this.signInData = this.createEmptySignIn();
          this.loadUsers();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.extractErrorMessage(error, 'Sign in failed. Check your credentials.');
        }
      });
  }

  signUp(signUpForm: NgForm): void {
    this.signUpSubmitted = true;

    if (signUpForm.invalid || !this.isValidUser(this.signUpData, true)) {
      signUpForm.control.markAllAsTouched();
      return;
    }

    this.authenticating = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = this.buildPayload(this.signUpData, true);
    payload.role = 'CLIENT';

    this.usersService.create(payload)
      .pipe(finalize(() => {
        this.authenticating = false;
      }))
      .subscribe({
        next: () => {
          this.authMode = 'sign-in';
          this.signInData = {
            identifier: this.signUpData.email || this.signUpData.username,
            password: this.signUpData.password
          };
          this.signUpData = this.createEmptyUser('CLIENT');
          this.signUpSubmitted = false;
          this.successMessage = 'Account created successfully as a client. Sign in to open your user space.';
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.extractErrorMessage(error, 'Sign up failed. Check the Django user-service.');
        }
      });
  }

  signOut(): void {
    this.currentUser = null;
    this.users = [];
    this.page = 1;
    this.searchTerm = '';
    this.errorMessage = '';
    this.successMessage = 'You have been signed out.';
    this.isFormOpen = false;
    localStorage.removeItem(this.sessionStorageKey);
  }

  becomeFreelancer(): void {
    if (!this.currentUser || !this.currentUser.id || this.isCurrentUserFreelancer) {
      this.router.navigate(['/skills']);
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: UserPayload = {
      username: this.currentUser.username,
      first_name: this.currentUser.first_name,
      last_name: this.currentUser.last_name,
      email: this.currentUser.email,
      role: 'FREELANCER',
      enabled: this.currentUser.enabled
    };

    this.usersService.update(this.currentUser.id, payload)
      .pipe(finalize(() => {
        this.saving = false;
      }))
      .subscribe({
        next: (updatedUser) => {
          this.applySession(updatedUser);
          this.successMessage = 'Your account is now freelancer. Complete your skills profile.';
          this.loadUsers();
          this.router.navigate(['/skills']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.extractErrorMessage(error, 'Cannot switch to freelancer right now.');
        }
      });
  }

  loadUsers(): void {
    if (!this.isAuthenticated) {
      return;
    }

    if (!this.canManageDirectory) {
      this.users = [];
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.usersService.getAll()
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (users) => {
          this.users = (users ?? []).map((user) => this.normalizeUser(user));
          this.normalizePage();
        },
        error: () => {
          this.errorMessage = 'Cannot load users. Check the Django user-service on port 8000.';
        }
      });
  }

  refreshData(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.loadUsers();
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.page = 1;
  }

  onSortFieldChange(value: string): void {
    if (
      value === 'id'
      || value === 'username'
      || value === 'email'
      || value === 'role'
      || value === 'created_at'
      || value === 'enabled'
    ) {
      this.sortField = value;
      this.page = 1;
    }
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.page = 1;
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page -= 1;
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page += 1;
    }
  }

  openCreate(): void {
    this.isEditMode = false;
    this.formUser = this.createEmptyUser();
    this.isFormOpen = true;
    this.formSubmitted = false;
    this.clearMessages();
  }

  openEdit(user: AppUser): void {
    this.isEditMode = true;
    this.formUser = {
      ...user,
      password: ''
    };
    this.isFormOpen = true;
    this.formSubmitted = false;
    this.clearMessages();
  }

  closeForm(): void {
    if (!this.saving) {
      this.isFormOpen = false;
      this.formSubmitted = false;
    }
  }

  saveUser(userForm: NgForm): void {
    this.formSubmitted = true;

    if (userForm.invalid || !this.isValidUser(this.formUser, !this.isEditMode)) {
      userForm.control.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.clearMessages();

    const payload = this.buildPayload(this.formUser, !this.isEditMode);
    const request = this.isEditMode && this.formUser.id
      ? this.usersService.update(this.formUser.id, payload)
      : this.usersService.create(payload);

    request
      .pipe(finalize(() => {
        this.saving = false;
      }))
      .subscribe({
        next: () => {
          this.successMessage = this.isEditMode ? 'User updated successfully.' : 'User added successfully.';
          this.isFormOpen = false;
          this.formSubmitted = false;
          this.loadUsers();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.extractErrorMessage(error, 'Save failed. Check the Django user-service.');
        }
      });
  }

  deleteUser(user: AppUser): void {
    if (!user.id || !window.confirm(`Delete ${user.username}?`)) {
      return;
    }

    this.deletingId = user.id;
    this.clearMessages();

    this.usersService.delete(user.id)
      .pipe(finalize(() => {
        this.deletingId = undefined;
      }))
      .subscribe({
        next: () => {
          this.successMessage = 'User deleted successfully.';
          this.users = this.users.filter((item) => item.id !== user.id);
          this.normalizePage();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.extractErrorMessage(error, 'Delete failed. Check the Django user-service.');
        }
      });
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('users-theme', this.isDarkMode ? 'dark' : 'light');
  }

  roleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      ADMIN: 'Admin',
      CLIENT: 'Client',
      FREELANCER: 'Freelancer',
      USER: 'User'
    };

    return labels[role];
  }

  roleClass(role: UserRole): string {
    return `role-${role.toLowerCase()}`;
  }

  statusClass(enabled: boolean): string {
    return enabled ? 'status-enabled' : 'status-disabled';
  }

  displayNameFor(user: Pick<UserFormValue, 'username' | 'first_name' | 'last_name'>): string {
    const fullName = `${user.first_name} ${user.last_name}`.trim();
    return fullName || user.username;
  }

  initialsFor(user: AppUser): string {
    const fullName = `${user.first_name} ${user.last_name}`.trim();

    if (fullName) {
      return fullName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
    }

    return user.username.slice(0, 2).toUpperCase();
  }

  formatDate(value: string): string {
    return this.datePipe.transform(value, 'dd/MM/yyyy HH:mm') ?? value;
  }

  shouldShowError(model: NgModel, submitted = this.formSubmitted): boolean {
    return Boolean(model.invalid && (model.touched || submitted));
  }

  hasError(model: NgModel, errorKey: string, submitted = this.formSubmitted): boolean {
    return this.shouldShowError(model, submitted) && Boolean(model.errors?.[errorKey]);
  }

  trackByUserId(_index: number, user: AppUser): number {
    return user.id;
  }

  private applySession(user: AppUser): void {
    this.currentUser = this.normalizeUser(user);
    localStorage.setItem(this.sessionStorageKey, JSON.stringify(this.currentUser));
  }

  private restoreSession(): void {
    const raw = localStorage.getItem(this.sessionStorageKey);

    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as AppUser;
      this.currentUser = this.normalizeUser(parsed);
    } catch {
      localStorage.removeItem(this.sessionStorageKey);
    }
  }

  private buildPayload(user: UserFormValue, requirePassword: boolean): UserPayload {
    const payload: UserPayload = {
      username: user.username.trim(),
      first_name: user.first_name.trim(),
      last_name: user.last_name.trim(),
      email: user.email.trim().toLowerCase(),
      role: user.role,
      enabled: user.enabled
    };

    if (user.password.trim()) {
      payload.password = user.password;
    } else if (requirePassword) {
      payload.password = user.password;
    }

    return payload;
  }

  private getSortValue(user: AppUser): number | string {
    switch (this.sortField) {
      case 'id':
        return user.id;
      case 'enabled':
        return user.enabled ? 1 : 0;
      case 'username':
        return user.username.toLowerCase();
      case 'email':
        return user.email.toLowerCase();
      case 'role':
        return user.role;
      case 'created_at':
        return user.created_at;
    }
  }

  private normalizeUser(user: AppUser): AppUser {
    return {
      ...user,
      username: user.username ?? '',
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      email: user.email ?? '',
      role: user.role ?? 'USER',
      enabled: Boolean(user.enabled),
      is_staff: Boolean(user.is_staff),
      is_superuser: Boolean(user.is_superuser),
      created_at: user.created_at ?? ''
    };
  }

  private normalizePage(): void {
    if (this.page > this.totalPages) {
      this.page = this.totalPages;
    }
  }

  private createEmptyUser(defaultRole: UserRole = 'USER'): UserFormValue {
    return {
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      role: defaultRole,
      enabled: true,
      is_staff: false,
      is_superuser: false,
      created_at: ''
    };
  }

  private createEmptySignIn(): SignInFormValue {
    return {
      identifier: '',
      password: ''
    };
  }

  private isValidUser(user: UserFormValue, requirePassword: boolean): boolean {
    return Boolean(user.username.trim())
      && Boolean(user.email.trim())
      && (!requirePassword || Boolean(user.password.trim()));
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private extractErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (error.error?.detail) {
      return error.error.detail;
    }

    if (error.error?.non_field_errors?.[0]) {
      return error.error.non_field_errors[0];
    }

    if (error.error && typeof error.error === 'object') {
      const firstEntry = Object.entries(error.error)[0];

      if (firstEntry) {
        const [field, value] = firstEntry;
        const message = Array.isArray(value) ? value[0] : value;
        return `${field}: ${message}`;
      }
    }

    return fallbackMessage;
  }

  private restoreThemePreference(): void {
    const savedTheme = localStorage.getItem('users-theme');

    if (savedTheme === 'light') {
      this.isDarkMode = false;
    }
  }
}
