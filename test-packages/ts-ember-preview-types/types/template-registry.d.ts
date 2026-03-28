import { ComponentLike, HelperLike } from '@norith/glint-template';

declare module '@norith/glint-environment-ember-loose/registry' {
  export default interface Registry {
    WelcomePage: ComponentLike;
    'page-title': HelperLike<{ Args: { Positional: [title: string] }; Return: void }>;
  }
}
