import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminAnalyticsComponent } from './admin-analytics.component';
import { provideHttpClient } from '@angular/common/http';

describe('AdminAnalyticsComponent', () => {
    let component: AdminAnalyticsComponent;
    let fixture: ComponentFixture<AdminAnalyticsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminAnalyticsComponent],
            providers: [provideHttpClient()],
        }).compileComponents();
        fixture = TestBed.createComponent(AdminAnalyticsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
