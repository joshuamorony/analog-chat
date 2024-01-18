import { signal } from '@angular/core';
import { connect } from 'ngxtension/connect';
import { createService } from 'ngxtension/create-injection-token';
import { Subject, map, merge, switchMap } from 'rxjs';
import { injectAuthService } from '../../../../shared/data-access/auth.service';
import type { Credentials } from '../../../../shared/interfaces/credentials';

export type RegisterStatus = 'pending' | 'creating' | 'success' | 'error';

export const [injectRegisterService, provideRegisterService] = createService(
	() => {
		const authService = injectAuthService();

		// sources$
		const error$ = new Subject<any>();
		const createUser$ = new Subject<Credentials>();

		const userCreated$ = createUser$.pipe(
			switchMap((credentials) =>
				authService.createAccount(credentials).catch((err) => {
					error$.next(err);
					return null as never;
				}),
			),
		);

		const nextStatus$ = merge(
			userCreated$.pipe(map(() => 'success' as const)),
			createUser$.pipe(map(() => 'creating' as const)),
			error$.pipe(map(() => 'error' as const)),
		);

		const status = signal<RegisterStatus>('pending');
		connect(status, nextStatus$);

		return {
			status: status.asReadonly(),
			createUser$,
		};
	},
	{ isRoot: false },
);
