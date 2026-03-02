import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'pis_theme';

  private modeSignal = signal<ThemeMode>(this.getInitialTheme());
  readonly mode = this.modeSignal.asReadonly();

  constructor() {
    this.apply(this.modeSignal());
  }

  private getInitialTheme(): ThemeMode {
    const saved = localStorage.getItem(this.storageKey) as ThemeMode | null;
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  }

  apply(mode: ThemeMode): void {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(this.storageKey, mode);
    this.modeSignal.set(mode);
  }

  toggle(): ThemeMode {
    const next = this.modeSignal() === 'dark' ? 'light' : 'dark';
    this.apply(next);
    return next;
  }

  getCurrent(): ThemeMode {
    return this.modeSignal();
  }
}

