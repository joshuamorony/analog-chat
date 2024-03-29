import { signal, inject } from '@angular/core';
import { connect } from 'ngxtension/connect';
import { createInjectable } from 'ngxtension/create-injectable';
import { Subject, merge, switchMap, from, EMPTY } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../../../shared/data-access/auth.service';
import type { Credentials } from '../../../../shared/interfaces/credentials';

export type LoginStatus = 'pending' | 'authenticating' | 'success' | 'error';

export const LoginService = createInjectable(
  () => {
    const authService = inject(AuthService);

    const error$ = new Subject<any>();
    const login$ = new Subject<Credentials>();

    const userAuthenticated$ = login$.pipe(
      switchMap((credentials) =>
        from(authService.login(credentials)).pipe(
          catchError((err) => {
            error$.next(err);
            return EMPTY
          })
        )
      ),
    );

    const nextStatus$ = merge(
      userAuthenticated$.pipe(map(() => 'success' as const)),
      login$.pipe(map(() => 'authenticating' as const)),
      error$.pipe(map(() => 'error' as const)),
    );

    const status = signal<LoginStatus>('pending');
    connect(status, nextStatus$);

    return { status: status.asReadonly(), login$ };
  }, { providedIn: 'scoped' }
);
