import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { AboutContent, SiteContentService } from '@core/services/site-content.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  content!: AboutContent;

  constructor(
    private siteContentService: SiteContentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.content = this.siteContentService.getContent().about;
  }

  getValues(): string[] {
    return this.content.values
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
