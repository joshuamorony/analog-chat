import { Component, effect, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { injectAuthService } from '../../../shared/data-access/auth.service';
import {
  injectLoginService,
  provideLoginService,
} from './data-access/login.service';
import { LoginFormComponent } from './ui/login-form.component';

@Component({
  standalone: true,
  selector: 'app-login',
  template: `
    <div class="container gradient-bg">
      @if(authService.user() !== undefined){
      <app-login-form
        [loginStatus]="loginService.status()"
        (login)="loginService.login$.next($event)"
      />
      <a routerLink="/auth/register">Create account</a>
      } @else {
      <mat-spinner diameter="50" />
      }
    </div>
  `,
  styles: `
			a {
				margin: 2rem;
				color: var(--accent-darker-color);
			}
		`,
  providers: [provideLoginService()],
  imports: [RouterLink, LoginFormComponent, MatProgressSpinnerModule],
})
export default class LoginComponent {
  public loginService = injectLoginService();
  public authService = injectAuthService();
  private router = inject(Router);

  constructor() {
    effect(() => {
      if (this.authService.user()) {
        this.router.navigate(['home']);
      }
    });
  }
}
