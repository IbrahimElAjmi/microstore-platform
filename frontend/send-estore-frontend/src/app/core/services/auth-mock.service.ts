import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, throwError, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginRequest, LoginResponse, RegisterRequest, UserResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthMockService {
  // Mock user database
  private mockUsers = [
    {
      userId: 1,
      email: 'admin@estore.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      token: 'mock-admin-token'
    },
    {
      userId: 2,
      email: 'user@estore.com',
      password: 'user123',
      firstName: 'Regular',
      lastName: 'User',
      role: 'CLIENT',
      token: 'mock-user-token'
    },
    {
      userId: 3,
      email: 'test@estore.com',
      password: 'test123',
      firstName: 'Test',
      lastName: 'User',
      role: 'CLIENT',
      token: 'mock-test-token'
    }
  ];

  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  login(request: LoginRequest): Observable<LoginResponse> {
    // Simulate API delay
    return of(request).pipe(
      delay(1000),
      map(req => {
        const user = this.mockUsers.find(u => 
          u.email === req.email && u.password === req.password
        );
        
        if (user) {
          const loginResponse: LoginResponse = {
            userId: user.userId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            message: 'Login successful'
          };
          
          this.currentUserSubject.next(loginResponse);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('currentUser', JSON.stringify(loginResponse));
          }
          
          return loginResponse;
        } else {
          throw new Error('Email or password incorrect');
        }
      })
    );
  }

  register(request: RegisterRequest): Observable<UserResponse> {
    // Simulate API delay
    return of(request).pipe(
      delay(1000),
      map(req => {
        // Check if user already exists
        const existingUser = this.mockUsers.find(u => u.email === req.email);
        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        const newUser: UserResponse = {
          id: this.mockUsers.length + 1,
          email: req.email,
          firstName: req.firstName,
          lastName: req.lastName,
          role: req.role
        };

        // Add to mock users (in real app, this would be API call)
        this.mockUsers.push({
          userId: newUser.id,
          email: newUser.email,
          password: req.password,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          token: `mock-token-${newUser.id}`
        });

        const loginResponse: LoginResponse = {
          userId: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          message: 'Registration successful'
        };

        this.currentUserSubject.next(loginResponse);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('currentUser', JSON.stringify(loginResponse));
        }
        
        return newUser;
      })
    );
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
      return currentUser ? JSON.parse(currentUser) : null;
    }
    return null;
  }

  getUserId(): number {
    const currentUser = this.getCurrentUser();
    return currentUser?.userId || 0;
  }

  getUserById(id: number): Observable<UserResponse> {
    const user = this.mockUsers.find(u => u.userId === id);
    if (!user) {
      throw new Error('User not found');
    }
    const userResponse: UserResponse = {
      id: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
    return of(userResponse).pipe(delay(500));
  }

  getProfile(userId: number): Observable<any> {
    const user = this.mockUsers.find(u => u.userId === userId);
    return of({
      userId: user?.userId,
      email: user?.email,
      firstName: user?.firstName,
      lastName: user?.lastName,
      phone: '+1 (555) 123-4567',
      address: '123 Tech Street, Silicon Valley, CA 94025'
    }).pipe(delay(500));
  }

  updateProfile(userId: number, dto: any): Observable<any> {
    const userIndex = this.mockUsers.findIndex(u => u.userId === userId);
    if (userIndex !== -1) {
      this.mockUsers[userIndex] = { ...this.mockUsers[userIndex], ...dto };
    }
    return of({ success: true }).pipe(delay(500));
  }

  setCurrentUser(user: LoginResponse): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }
}
