import { expectTypeOf } from 'expect-type';
import { resolve, resolveOrReturn } from '@norith/glint-environment-glimmerx/-private/dsl';

{
  const shout = (arg: string): string => arg.toUpperCase();

  expectTypeOf(resolve(shout)).toEqualTypeOf<(arg: string) => string>();
  expectTypeOf(resolveOrReturn(shout)).toEqualTypeOf<(arg: string) => string>();

  // @ts-expect-error: strings are not resolvable
  resolve('hello');
  expectTypeOf(resolveOrReturn('hello')).toEqualTypeOf<() => string>();
}
