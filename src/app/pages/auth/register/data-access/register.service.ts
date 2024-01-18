import { signal } from '@angular/core';
import { connect } from 'ngxtension/connect';
import { createService } from 'ngxtension/create-injection-token';
import { Subject, map, merge, switchMap, from, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { injectAuthService } from '../../../../shared/data-access/auth.service';
import type { Credentials } from '../../../../shared/interfaces/credentials';

export type RegisterStatus = 'pending' | 'creating' | 'success' | 'error';

export const [injectRegisterService, provideRegisterService] = createService(
  () => {
    const authService = injectAuthService();
    const error$ = new Subject<any>();
    const createUser$ = new Subject<Credentials>();

    const userCreated$ = createUser$.pipe(
      switchMap((credentials) =>
        from(authService.createAccount(credentials)).pipe(
          catchError((err) => {
            error$.next(err);
            return EMPTY
          })
        )
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
