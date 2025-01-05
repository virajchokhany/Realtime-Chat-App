import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthService } from './auth.service';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  isUserLoggedIn: boolean = false;
  private readonly _destroying$ = new Subject<void>();
  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to login state changes
    this.authService.loginState$
      .pipe(takeUntil(this._destroying$))
      .subscribe((isLoggedIn) => {
        this.isUserLoggedIn = isLoggedIn;
      });

    // Set initial state
    this.isUserLoggedIn = this.authService.isLoggedIn();
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
