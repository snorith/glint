import { HelperLike } from '@norith/glint-template';

export type ConcatHelper = HelperLike<{
  Args: { Positional: unknown[] };
  Return: string;
}>;
