import { provideFileRouter } from '@analogjs/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { createInjectionToken } from 'ngxtension/create-injection-token';

import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import {
  Firestore,
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
} from 'firebase/firestore';
import { environment } from '../environments/environment';

const app = initializeApp(environment.firebase);

export const [injectFirebaseAuth] = createInjectionToken(() => {
  const auth = getAuth();
  if (environment.useEmulators) {
    connectAuthEmulator(auth, 'http://localhost:9099', {
      disableWarnings: true,
    });
  }
  return auth;
});

export const [injectFirestore] = createInjectionToken(() => {
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
    provideAnimations(),
  ],
};
