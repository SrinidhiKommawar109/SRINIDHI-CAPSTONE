import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(private injector: Injector, private zone: NgZone) { }

    handleError(error: any): void {
        const router = this.injector.get(Router);

        // Log error to console for debugging
        console.error('Global Error Handler:', error);

        // Navigate to /not-found within NgZone
        this.zone.run(() => {
            router.navigate(['/not-found']);
        });
    }
}
