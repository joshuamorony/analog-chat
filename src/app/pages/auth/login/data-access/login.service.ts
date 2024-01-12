import { signal } from '@angular/core';
import { connect } from 'ngxtension/connect';
import { createService } from 'ngxtension/create-injection-token';
import { Subject, merge, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { injectAuthService } from '../../../../shared/data-access/auth.service';
import type { Credentials } from '../../../../shared/interfaces/credentials';

export type LoginStatus = 'pending' | 'authenticating' | 'success' | 'error';

export const [injectLoginService, provideLoginService] = createService(
  () => {
    const authService = injectAuthService();

    const error$ = new Subject<any>();
    const login$ = new Subject<Credentials>();

    const userAuthenticated$ = login$.pipe(
      switchMap((credentials) =>
        authService.login(credentials).catch((err) => {
          error$.next(err);
          return null as never;
        })
      )
    );
    const nextStatus$ = merge(
      userAuthenticated$.pipe(map(() => 'success' as const)),
      login$.pipe(map(() => 'authenticating' as const)),
      error$.pipe(map(() => 'error' as const))
    );

    const status = signal<LoginStatus>('pending');
    connect(status, nextStatus$);

    return { status: status.asReadonly(), login$ };
  },
  { isRoot: false }
);