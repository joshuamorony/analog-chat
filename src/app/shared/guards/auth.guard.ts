import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { injectAuthService } from '../data-access/auth.service';

export const isAuthenticatedGuard = (): CanActivateFn => {
	return () => {
		const [authService, router] = [injectAuthService(), inject(Router)];

		if (authService.user()) {
			return true;
		}

		return router.parseUrl('/auth/login');
	};
};
