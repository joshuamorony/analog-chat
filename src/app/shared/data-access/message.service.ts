import { computed, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { addDoc, collection, limit, orderBy, query } from 'firebase/firestore';
import { connect } from 'ngxtension/connect';
import { createService } from 'ngxtension/create-injection-token';
import { collectionData } from 'rxfire/firestore';
import { Subject, defer, exhaustMap, merge, type Observable } from 'rxjs';
import { filter, map, retry } from 'rxjs/operators';
import { injectFirestore } from 'src/app/app.config';
import type { Message } from '../interfaces/message';
import { injectAuthService } from './auth.service';

export const [injectMessageService] = createService(() => {
  const [firestore, authService] = [injectFirestore(), injectAuthService()];

  const authUser$ = toObservable(authService.user);

  const getMessages = () => {
    const messagesCollection = query(
      collection(firestore, 'messages'),
      orderBy('created', 'desc'),
      limit(50)
    );

    return collectionData(messagesCollection, { idField: 'id' }).pipe(
      map((messages) => [...messages].reverse())
    ) as Observable<Message[]>;
  };

  // sources$
  const messages$ = getMessages().pipe(
    retry({
      delay: () => authUser$.pipe(filter((user) => !!user)),
    })
  );
  const add$ = new Subject<Message['content']>();
  const error$ = new Subject<string>();
  const logout$ = authUser$.pipe(filter((user) => !user));

  // state
  const state = signal({
    messages: [] as Message[],
    error: null as string | null,
  });

  // reducers
  const addMessage = (message: string) => {
    const newMessage = {
      author: authService.user()?.email,
      content: message,
      created: Date.now().toString(),
    };

    const messagesCollection = collection(firestore, 'messages');
    return defer(() => addDoc(messagesCollection, newMessage));
  };

  add$.pipe(takeUntilDestroyed(), exhaustMap(addMessage)).subscribe({
    error: (err) => {
      console.log(err);
      error$.next('Failed to send message');
    },
  });

  const nextMessages$ = merge(messages$, logout$.pipe(map(() => []))).pipe(
    map((messages) => ({ messages }))
  );
  const nextError$ = error$.pipe(map((error) => ({ error })));

  connect(state, merge(nextMessages$, nextError$));

  return {
    messages: computed(() => state().messages),
    error: computed(() => state().error),
    add$,
  };
});
