import Component from '@ember/component';

export default class Qux extends Component {
  name = 'QUX';
}

declare module '@norith/glint-environment-ember-loose/registry' {
  export default interface Registry {
    Qux: typeof Qux;
  }
}
