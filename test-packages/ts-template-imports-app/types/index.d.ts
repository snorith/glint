import '@norith/glint-environment-ember-template-imports';

import { HelperLike } from '@norith/glint-template';

declare module '@norith/glint-environment-ember-template-imports/globals' {
  export default interface Globals {
    t: HelperLike<{
      Args: {
        Positional: string[];
        Named: Record<string, unknown>;
      };
      Return: string;
    }>;
  }
}
