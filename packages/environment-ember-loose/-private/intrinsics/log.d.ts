import { HelperLike } from '@norith/glint-template';

export type LogHelper = HelperLike<{
  Args: { Positional: unknown[] };
  Return: void;
}>;
