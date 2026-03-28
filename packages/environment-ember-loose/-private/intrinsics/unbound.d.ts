import { HelperLike } from '@norith/glint-template';

export type UnboundKeyword = abstract new <T>() => InstanceType<
  HelperLike<{
    Args: {
      Positional: [value: T];
    };
    Return: T;
  }>
>;
