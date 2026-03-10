import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClaimsDashboardComponent } from './claims-dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('ClaimsDashboardComponent', () => {
    let component: ClaimsDashboardComponent;
    let fixture: ComponentFixture<ClaimsDashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ClaimsDashboardComponent,
                HttpClientTestingModule,
                FormsModule,
                CommonModule,
                RouterTestingModule,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ClaimsDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
