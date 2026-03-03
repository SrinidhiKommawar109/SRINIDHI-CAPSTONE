import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClaimsHistoryComponent } from './claims-history.component';
import { ClaimsService } from '../../../../core/claims.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

describe('ClaimsHistoryComponent', () => {
    let component: ClaimsHistoryComponent;
    let fixture: ComponentFixture<ClaimsHistoryComponent>;
    let mockClaimsService: any;

    beforeEach(async () => {
        mockClaimsService = {
            getClaimsHistory: vi.fn(() => of([]))
        };

        await TestBed.configureTestingModule({
            imports: [ClaimsHistoryComponent, CommonModule, HttpClientTestingModule],
            providers: [
                { provide: ClaimsService, useValue: mockClaimsService },
                ChangeDetectorRef
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ClaimsHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(mockClaimsService.getClaimsHistory).toHaveBeenCalled();
    });
});
