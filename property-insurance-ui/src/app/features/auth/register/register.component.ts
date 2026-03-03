import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, UserRole } from '../../../core/auth.service';
import { NotificationsService } from '../../../core/notifications.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);
    private readonly notifications = inject(NotificationsService);

    form: FormGroup = this.fb.group({
        fullName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        referralCode: [''],
        captchaAnswer: ['', [Validators.required]],
    });

    captchaQuestion = '';
    private correctCaptchaAnswer = 0;
    loading = false;
    formSubmitted = false;
    errorMessage = '';

    ngOnInit(): void {
        this.generateCaptcha();
    }

    generateCaptcha(): void {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        this.correctCaptchaAnswer = num1 + num2;
        this.captchaQuestion = `What is ${num1} + ${num2}?`;
        this.form.get('captchaAnswer')?.reset();
    }

    onSubmit(): void {
        this.formSubmitted = true;
        this.errorMessage = '';

        if (this.form.invalid) {
            return;
        }

        const userAnswer = parseInt(this.form.get('captchaAnswer')?.value, 10);
        if (userAnswer !== this.correctCaptchaAnswer) {
            this.errorMessage = 'Incorrect captcha answer. Please try again.';
            this.generateCaptcha();
            return;
        }

        this.loading = true;
        const { fullName, email, password, referralCode } = this.form.value;

        this.auth
            .register({ fullName, email, password, role: 'Customer', referralCode })
            .subscribe({
                next: () => {
                    this.loading = false;
                    this.notifications.show({
                        title: 'Registration Successful',
                        message: 'You can now login with your credentials.',
                        type: 'success',
                    });
                    this.router.navigate(['/login']);
                },
                error: () => {
                    this.loading = false;
                    this.generateCaptcha();
                    this.router.navigate(['/not-found']);
                },
            });
    }
}
