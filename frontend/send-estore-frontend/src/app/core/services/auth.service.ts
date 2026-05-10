import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, UserResponse, UserUpdateRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private currentUserSubject: BehaviorSubject<LoginResponse | null>;
  public currentUser$: Observable<LoginResponse | null>;

  constructor() {
    let initialUser: LoginResponse | null = null;
    if (typeof localStorage !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          initialUser = JSON.parse(storedUser);
        } catch {
          localStorage.removeItem('currentUser');
        }
      }
    }
    this.currentUserSubject = new BehaviorSubject<LoginResponse | null>(initialUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.customerServiceUrl}/api/auth/login`, request);
  }

  register(request: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${environment.customerServiceUrl}/api/auth/register`, request);
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    if (typeof localStorage !== 'undefined') {
      const currentUser = localStorage.getItem('currentUser');
      return !!currentUser;
    }
    return false;
  }

  isAdmin(): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser?.role === 'ADMIN';
  }

  getCurrentUser(): LoginResponse | null {
    if (typeof localStorage !== 'undefined') {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        return null;
      }

      try {
        return JSON.parse(currentUser);
      } catch {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        return null;
      }
    }
    return null;
  }

  getUserId(): number {
    const currentUser = this.getCurrentUser();
    return currentUser?.userId || 0;
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${environment.customerServiceUrl}/api/users/${id}`);
  }

  getUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${environment.customerServiceUrl}/api/users`);
  }

  createClient(request: RegisterRequest, requestedBy: number): Observable<UserResponse> {
    return this.http.post<UserResponse>(
      `${environment.customerServiceUrl}/api/users/clients?requestedBy=${requestedBy}`,
      { ...request, role: 'CLIENT' }
    );
  }

  updateClient(id: number, request: UserUpdateRequest, requestedBy: number): Observable<UserResponse> {
    return this.http.put<UserResponse>(
      `${environment.customerServiceUrl}/api/users/clients/${id}?requestedBy=${requestedBy}`,
      request
    );
  }

  deleteClient(id: number, requestedBy: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.customerServiceUrl}/api/users/clients/${id}?requestedBy=${requestedBy}`
    );
  }

  getProfile(userId: number): Observable<any> {
    return this.http.get(`${environment.customerServiceUrl}/api/users/${userId}/profile`);
  }

  updateProfile(userId: number, dto: any): Observable<any> {
    return this.http.put(`${environment.customerServiceUrl}/api/users/${userId}/profile`, dto);
  }

  setCurrentUser(user: LoginResponse): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }
}
