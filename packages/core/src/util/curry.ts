export interface OneMore<T, R> {
  (): OneMore<T, R>
  (t: T): R
}

export interface TwoMore<T1, T2, R> {
  (): TwoMore<T1, T2, R>
  (t1: T1): OneMore<T2, R>
  (t1: T1, t2: T2): R
}

export interface ThreeMore<T1, T2, T3, R> {
  (): ThreeMore<T1, T2, T3, R>
  (t1: T1): TwoMore<T2, T3, R>
  (t1: T1, t2: T2): OneMore<T3, R>
  (t1: T1, t2: T2, t3: T3): R
}

/**
 * Takes a function with 1 argument and returns a curried version of it
 * 
 * @export
 * @template A
 * @template B
 * @param {(a: A) => B} f
 * @returns {OneMore<A, B>}
 */
export function curry1<A, B> (f: (a: A) => B): OneMore<A, B> {
  function curried (a: A) {
    switch (arguments.length) {
      case 0: return curried
      case 1: return f(a)
      default: return curried
    }
  }
}

/**
 * Takes a function with 2 arguments and returns a curried version of it
 * 
 * @export
 * @template A
 * @template B
 * @template C
 * @param {(a: A, b: B) => C} f
 * @returns {TwoMore<A, B, C>}
 */
export function curry2<A, B, C> (f: (a: A, b: B) => C): TwoMore<A, B, C> {
  function curried (a?: A, b?: B) {
    switch (arguments.length) {
      case 0: return curried
      case 1: return curry1<B, C>((b: B) => f(a, b))
      case 2: return f(a, b)
      default: return curried
    }
  }

  return curried
}

/**
 * Takes a function with 3 arguments and returns a curried version
 * 
 * @export
 * @template A
 * @template B
 * @template C
 * @template D
 * @param {(a: A, b: B, c: C) => D} f
 * @returns {ThreeMore<A, B, C, D>}
 */
export function curry3<A, B, C, D> (f: (a: A, b: B, c: C) => D): ThreeMore<A, B, C, D> {
  function curried (a?: A, b?: B, c?: C) {
    switch (arguments) {
      case 0: return curried
      case 1: return curry2<B, C, D>((b: B, c: C) => f(a, b, c))
      case 2: return curry1<C, D>((c: C) => f(a, b, c))
      case 3: return f(a, b, c)
      default: return curried
    }
  }

  return curried
}
