import { HelperLike } from '@norith/glint-template';

export type OutletKeyword = HelperLike<{
  Args: {
    Positional: [name?: string];
  };
  Return: void;
}>;
