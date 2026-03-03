import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClaimsPendingComponent } from './claims-pending.component';
import { ClaimsService } from '../../../../core/claims.service';
import { NotificationsService } from '../../../../core/notifications.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

describe('ClaimsPendingComponent', () => {
    let component: ClaimsPendingComponent;
    let fixture: ComponentFixture<ClaimsPendingComponent>;
    let mockClaimsService: any;
    let mockNotificationsService: any;

    beforeEach(async () => {
        mockClaimsService = {
            getPendingClaims: vi.fn(() => of([])),
            verifyClaim: vi.fn(() => of({}))
        };

        mockNotificationsService = {
            show: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [ClaimsPendingComponent, CommonModule, FormsModule, HttpClientTestingModule],
            providers: [
                { provide: ClaimsService, useValue: mockClaimsService },
                { provide: NotificationsService, useValue: mockNotificationsService },
                ChangeDetectorRef
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ClaimsPendingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(mockClaimsService.getPendingClaims).toHaveBeenCalled();
    });

    it('should verify claim', () => {
        component.verifyClaim(1, true);
        expect(mockClaimsService.verifyClaim).toHaveBeenCalledWith(1, { isAccepted: true, remarks: '' });
        expect(mockNotificationsService.show).toHaveBeenCalled();
    });
});
