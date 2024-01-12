import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, InjectionToken } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideFileRouter } from '@analogjs/router';
import { createInjectionToken } from 'ngxtension/create-injection-token';

import { initializeApp } from 'firebase/app';
import {
  Firestore,
  initializeFirestore,
  connectFirestoreEmulator,
  getFirestore,
} from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { environment } from '../environments/environment';

const app = initializeApp(environment.firebase);

export const [, , AUTH] = createInjectionToken(() => {
  const auth = getAuth();
  if (environment.useEmulators) {
    connectAuthEmulator(auth, 'http://localhost:9099', {
      disableWarnings: true,
    });
  }
  return auth;
});

export const [, , FIRESTORE] = createInjectionToken(() => {
  let firestore: Firestore;
  if (environment.useEmulators) {
    firestore = initializeFirestore(app, {});
    connectFirestoreEmulator(firestore, 'localhost', 8080);
  } else {
    firestore = getFirestore();
  }
  return firestore;
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideFileRouter(),
    provideHttpClient(withFetch()),
    provideClientHydration(),
  ],
};
