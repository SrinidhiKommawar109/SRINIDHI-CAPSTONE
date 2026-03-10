import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ErrorComponent } from './error.component';
import { vi } from 'vitest';

describe('ErrorComponent', () => {
    let component: ErrorComponent;
    let fixture: ComponentFixture<ErrorComponent>;
    let mockRouter: any;

    beforeEach(async () => {
        // Create a mock router map for required methods
        mockRouter = {
            getCurrentNavigation: vi.fn(),
            navigate: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [ErrorComponent], // ErrorComponent is standalone
            providers: [
                { provide: Router, useValue: mockRouter }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ErrorComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        // Clean up history state after each test to prevent test pollution
        history.replaceState(null, '');
        vi.clearAllMocks();
    });

    describe('Component Creation', () => {
        it('should create the component with default error values', () => {
            mockRouter.getCurrentNavigation.mockReturnValue(null);
            fixture.detectChanges(); // Triggers ngOnInit

            expect(component).toBeTruthy();
            expect(component.errorCode).toBe('Unknown Error');
            expect(component.errorMessage).toBe('An unexpected error occurred. Please try again later.');
        });
    });

    describe('ngOnInit - State Handling', () => {
        describe('via Router.getCurrentNavigation()', () => {
            it('should handle 404 status correctly', () => {
                mockRouter.getCurrentNavigation.mockReturnValue({
                    extras: { state: { status: 404 } }
                });

                fixture.detectChanges();

                expect(component.errorCode).toBe(404);
                expect(component.errorMessage).toBe('The page you are looking for does not exist.');
            });

            it('should extract error details (status and title)', () => {
                mockRouter.getCurrentNavigation.mockReturnValue({
                    extras: {
                        state: { error: { status: 500, title: 'Server Error' } }
                    }
                });

                fixture.detectChanges();

                expect(component.errorCode).toBe(500);
                expect(component.errorMessage).toBe('Server Error');
            });

            it('should extract error details (message as fallback if title missing)', () => {
                mockRouter.getCurrentNavigation.mockReturnValue({
                    extras: {
                        state: { error: { status: 401, message: 'Unauthorized Request' } }
                    }
                });

                fixture.detectChanges();

                expect(component.errorCode).toBe(401);
                expect(component.errorMessage).toBe('Unauthorized Request');
            });

            it('should keep default string "Error" if status is missing', () => {
                mockRouter.getCurrentNavigation.mockReturnValue({
                    extras: { state: { error: { detail: 'Only detail provided' } } }
                });

                fixture.detectChanges();

                expect(component.errorCode).toBe('Error');
                expect(component.errorMessage).toBe('Only detail provided');
            });
        });

        describe('via History API (history.state) Fallback', () => {
            it('should handle 404 status correctly from history state', () => {
                mockRouter.getCurrentNavigation.mockReturnValue(null);
                history.replaceState({ status: 404 }, '');

                fixture.detectChanges();

                expect(component.errorCode).toBe(404);
                expect(component.errorMessage).toBe('The page you are looking for does not exist.');
            });

            it('should extract error details from history state', () => {
                mockRouter.getCurrentNavigation.mockReturnValue(null);
                history.replaceState({ error: { status: 503, message: 'Service Unavailable' } }, '');

                fixture.detectChanges();

                expect(component.errorCode).toBe(503);
                expect(component.errorMessage).toBe('Service Unavailable');
            });
        });
    });

    describe('Method Logic: goHome()', () => {
        it('should navigate to the home route "/"', () => {
            component.goHome();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        });
    });

    describe('DOM Rendering', () => {
        it('should reflect error code and message changes in the component', () => {
            mockRouter.getCurrentNavigation.mockReturnValue(null);

            component.errorCode = 502;
            component.errorMessage = 'Bad Gateway Error';
            fixture.detectChanges();

            const compiled = fixture.nativeElement as HTMLElement;
            expect(compiled.textContent).toContain('502');
            expect(compiled.textContent).toContain('Bad Gateway Error');
        });
    });
});
