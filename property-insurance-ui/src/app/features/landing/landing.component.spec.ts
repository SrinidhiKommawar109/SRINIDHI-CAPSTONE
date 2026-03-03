import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingComponent } from './landing.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/theme.service';
import { signal } from '@angular/core';

describe('LandingComponent', () => {
    let component: LandingComponent;
    let fixture: ComponentFixture<LandingComponent>;
    let mockThemeService: any;

    beforeEach(async () => {
        mockThemeService = {
            mode: signal('light')
        };

        await TestBed.configureTestingModule({
            imports: [LandingComponent, RouterTestingModule, CommonModule],
            providers: [
                { provide: ThemeService, useValue: mockThemeService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LandingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle like options', () => {
        const option = 'Policy Variety';
        expect(component.isLikeSelected(option)).toBeFalse();
        component.toggleLike(option);
        expect(component.isLikeSelected(option)).toBeTrue();
        component.toggleLike(option);
        expect(component.isLikeSelected(option)).toBeFalse();
    });
});
