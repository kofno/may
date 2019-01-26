import { always, pipe } from '@kofno/piper';

export interface Just<T> {
  kind: 'just';
  readonly value: T;
}

export interface Nothing {
  kind: 'nothing';
}

export type Maybe<A> = Just<A> | Nothing;

export function just<A>(value: A): Maybe<A> {
  return { kind: 'just', value };
}

export function nothing<A>(): Maybe<A> {
  return { kind: 'nothing' };
}

export interface Catamporphism<A, B> {
  just: (a: A) => B;
  nothing: () => B;
}

export function cata<A, B>(matcher: Catamporphism<A, B>, maybe: Maybe<A>): B;
export function cata<A, B>(matcher: Catamporphism<A, B>): (maybe: Maybe<A>) => B;
export function cata<A, B>(matcher: Catamporphism<A, B>, maybe?: Maybe<A>) {
  const fold = (maybe: Maybe<A>) => {
    switch (maybe.kind) {
      case 'just':
        return matcher.just(maybe.value);
      case 'nothing':
        return matcher.nothing();
    }
  };

  return typeof maybe === 'undefined' ? fold : fold(maybe);
}

export function map<A, B>(fn: (a: A) => B, maybe: Maybe<A>): Maybe<B>;
export function map<A, B>(fn: (a: A) => B): (maybe: Maybe<A>) => Maybe<B>;
export function map<A, B>(fn: (a: A) => B, maybe?: Maybe<A>) {
  const makeItSo = pipe(
    fn,
    just,
  );
  return typeof maybe === 'undefined' ? andThen(makeItSo) : andThen(makeItSo, maybe);
}

export function andThen<A, B>(fn: (a: A) => Maybe<B>, maybe: Maybe<A>): Maybe<B>;
export function andThen<A, B>(fn: (a: A) => Maybe<B>): (maybe: Maybe<A>) => Maybe<B>;
export function andThen<A, B>(fn: (a: A) => Maybe<B>, maybe?: Maybe<A>) {
  const mapper = (maybe: Maybe<A>) => {
    switch (maybe.kind) {
      case 'just':
        return fn(maybe.value);
      case 'nothing':
        return maybe;
    }
  };

  return typeof maybe === 'undefined' ? mapper : mapper(maybe);
}

export function orElse<A>(fn: () => Maybe<A>, maybe?: Maybe<A>) {
  const mapper = (maybe: Maybe<A>) => {
    switch (maybe.kind) {
      case 'just':
        return maybe;
      case 'nothing':
        return fn();
    }
  };

  return typeof maybe === 'undefined' ? mapper : mapper(maybe);
}

export function unwrap<A>(defaultValue: A, maybe?: Maybe<A>) {
  return lazyUnwrap(always(defaultValue), maybe);
}

export function lazyUnwrap<A>(defaultProducer: () => A, maybe?: Maybe<A>) {
  const unwrapper = (maybe: Maybe<A>) => {
    switch (maybe.kind) {
      case 'just':
        return maybe.value;
      case 'nothing':
        return defaultProducer();
    }
  };

  return typeof maybe === 'undefined' ? unwrapper : unwrapper(maybe);
}

export interface Emptyable {
  length: number;
}

export function fromEmpty<A extends Emptyable>(value: A): Maybe<A> {
  return value.length === 0 ? nothing() : just(value);
}

export function fromNullable<A>(value: A | null | undefined): Maybe<A> {
  if (value === null || typeof value === 'undefined') {
    return nothing();
  }
  return just(value);
}
