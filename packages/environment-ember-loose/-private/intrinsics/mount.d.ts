import { HelperLike } from '@norith/glint-template';

export type MountKeyword = HelperLike<{
  Args: {
    Positional: [engine: string];
    Named: { model?: unknown };
  };
  Return: void;
}>;
