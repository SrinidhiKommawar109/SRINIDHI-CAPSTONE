import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {
  errorCode: number | string = 'Unknown Error';
  errorMessage: string = 'An unexpected error occurred. Please try again later.';
  
  constructor(private router: Router) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      const state = navigation.extras.state as { error: any, status?: number };
      
      if (state.status === 404) {
        this.errorCode = 404;
        this.errorMessage = 'The page you are looking for does not exist.';
      } else if (state.error) {
        // Attempt to parse standard ProblemDetails or other error formats
        this.errorCode = state.error.status || 'Error';
        this.errorMessage = state.error.title || state.error.message || state.error.detail || this.errorMessage;
      }
    } else if (history.state) {
      // Fallback if accessed via history state directly
      const state = history.state;
      if (state.status === 404) {
        this.errorCode = 404;
        this.errorMessage = 'The page you are looking for does not exist.';
      } else if (state.error) {
        this.errorCode = state.error.status || 'Error';
        this.errorMessage = state.error.title || state.error.message || state.error.detail || this.errorMessage;
      }
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
