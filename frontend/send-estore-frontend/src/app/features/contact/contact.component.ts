import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactContent, SiteContentService } from '@core/services/site-content.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  content!: ContactContent;
  contactForm: FormGroup;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private siteContentService: SiteContentService
  ) {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.content = this.siteContentService.getContent().contact;
  }

  submitMessage(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.successMessage = 'Message prepare. Notre equipe vous contactera rapidement.';
    this.contactForm.reset();
  }
}
