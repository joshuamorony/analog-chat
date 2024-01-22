import { signal } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { connect } from 'ngxtension/connect';
import { createInjectable } from 'ngxtension/create-injectable';
import { authState } from 'rxfire/auth';
import { injectFirebaseAuth } from '../../app.config';
import { type Credentials } from '../interfaces/credentials';

export type AuthUser = User | null | undefined;

export const AuthService = createInjectable(() => {
  const auth = injectFirebaseAuth();

  const user$ = authState(auth);
  const user = signal<AuthUser>(undefined);

  connect(user, user$);

  return {
    user: user.asReadonly(),
    login: (credentials: Credentials) => {
      return signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password,
      );
    },
    logout: () => {
      signOut(auth);
    },
    createAccount: (credentials: Credentials) => {
      return createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password,
      );
    },
  };
}, { providedIn: 'root' });
