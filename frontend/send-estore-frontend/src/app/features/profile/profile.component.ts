import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserResponse, ProfileResponse, ProfileDTO } from '@core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: UserResponse | null = null;
  profile: ProfileResponse | null = null;
  profileForm: FormGroup;
  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      phone: [''],
      address: [''],
      city: [''],
      country: [''],
      photoUrl: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getUserById(currentUser.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loadProfile(user.id);
      },
      error: () => {
        this.user = {
          id: currentUser.userId,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
          role: currentUser.role
        };
        this.loadProfile(currentUser.userId);
      }
    });
  }

  updateProfile(): void {
    if (!this.user || this.profileForm.invalid) {
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const profileData: ProfileDTO = this.profileForm.value;
    this.authService.updateProfile(this.user.id, profileData).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm.patchValue({
          phone: profile.phone || '',
          address: profile.address || '',
          city: profile.city || '',
          country: profile.country || '',
          photoUrl: profile.photoUrl || ''
        });
        
        // Update current user in auth service to refresh navbar photo
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          currentUser.photoUrl = profile.photoUrl;
          this.authService.setCurrentUser(currentUser);
        }

        this.successMessage = 'Profil mis a jour avec succes';
        this.isSaving = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Impossible de mettre a jour le profil';
        this.isSaving = false;
        this.cdr.markForCheck();
      }
    });
  }

  getInitials(): string {
    if (!this.user) {
      return 'U';
    }
    return `${this.user.firstName?.[0] || ''}${this.user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  }

  getRoleBadgeClass(): string {
    return this.user?.role === 'ADMIN'
      ? 'bg-[#fee2e2] text-[#991b1b] border-[#fecaca]'
      : 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]';
  }

  getRoleText(): string {
    return this.user?.role === 'ADMIN' ? 'Administrateur' : 'Client';
  }

  private loadProfile(userId: number): void {
    this.authService.getProfile(userId).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm.patchValue({
          phone: profile.phone || '',
          address: profile.address || '',
          city: profile.city || '',
          country: profile.country || '',
          photoUrl: profile.photoUrl || ''
        });
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.profile = {
          id: 0,
          userId,
          phone: '',
          address: '',
          city: '',
          country: '',
          photoUrl: ''
        };
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
