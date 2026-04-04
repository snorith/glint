import ts from 'typescript';
import { describe, test, expect } from 'vitest';
import { rewriteModule } from '../../src/transform/index.js';
import { stripIndent } from 'common-tags';
import { GlintEnvironment } from '../../src/config/index.js';

describe('Transform: rewriteModule', () => {
  describe('inline tagged template', () => {
    const glimmerxEnvironment = GlintEnvironment.load('glimmerx');

    test('with a simple class', () => {
      let script = {
        filename: 'test.ts',
        contents: stripIndent`
          import Component, { hbs } from '@glimmerx/component';
          export default class MyComponent extends Component {
            static template = hbs\`\`;
          }
        `,
      };

      let transformedModule = rewriteModule(ts, { script }, glimmerxEnvironment);

      expect(transformedModule?.errors).toEqual([]);
      expect(transformedModule?.transformedContents).toMatchInlineSnapshot(`
        "import Component, { hbs } from '@glimmerx/component';
        export default class MyComponent extends Component {
          static template = ({} as typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")) {
          hbs;
          𝚪; χ;
        });
        }"
      `);
    });

    test('with a class with type parameters', () => {
      let script = {
        filename: 'test.ts',
        contents: stripIndent`
          import Component, { hbs } from '@glimmerx/component';
          export default class MyComponent<K extends string> extends Component<{ value: K }> {
            static template = hbs\`\`;
          }
        `,
      };

      let transformedModule = rewriteModule(ts, { script }, glimmerxEnvironment);

      expect(transformedModule?.errors).toEqual([]);
      expect(transformedModule?.transformedContents).toMatchInlineSnapshot(`
        "import Component, { hbs } from '@glimmerx/component';
        export default class MyComponent<K extends string> extends Component<{ value: K }> {
          static template = ({} as typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")) {
          hbs;
          𝚪; χ;
        });
        }"
      `);
    });

    test('with an anonymous class', () => {
      let script = {
        filename: 'test.ts',
        contents: stripIndent`
          import Component, { hbs } from '@glimmerx/component';
          export default class extends Component {
            static template = hbs\`\`;
          }
        `,
      };

      let transformedModule = rewriteModule(ts, { script }, glimmerxEnvironment);

      expect(transformedModule?.transformedContents).toMatchInlineSnapshot(`
        "import Component, { hbs } from '@glimmerx/component';
        export default class extends Component {
          static template = ({} as typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")) {
          hbs;
          𝚪; χ;
        });
        }"
      `);
    });

    test('with a syntax error', () => {
      let script = {
        filename: 'test.ts',
        contents: stripIndent`
          import Component, { hbs } from '@glimmerx/component';
          export default class MyComponent extends Component {
            static template = hbs\`
              {{hello
            \`;
          }
        `,
      };

      let transformedModule = rewriteModule(ts, { script }, glimmerxEnvironment);

      expect(transformedModule?.errors.length).toBe(1);
      expect(transformedModule?.transformedContents).toMatchInlineSnapshot(`
        "import Component, { hbs } from '@glimmerx/component';
        export default class MyComponent extends Component {
          static template = ({} as typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")) {
          hbs;
          𝚪; χ;
        });
        }"
      `);
    });

    test('outer variable capture', () => {
      let testEnvironment = new GlintEnvironment(['test'], {
        tags: {
          '@norith/glint-test-env': {
            hbsCaptureAll: { typesModule: '@norith/glint-test-env', globals: [] },
            hbsCaptureSome: { typesModule: '@norith/glint-test-env', globals: ['global'] },
            hbsCaptureNone: { typesModule: '@norith/glint-test-env' },
          },
        },
      });

      let script = {
        filename: 'test.ts',
        contents: stripIndent`
          import { hbsCaptureAll, hbsCaptureSome, hbsCaptureNone } from '@norith/glint-test-env';

          const message = 'hello';

          hbsCaptureAll\`{{global}} {{message}}\`;
          hbsCaptureSome\`{{global}} {{message}}\`;
          hbsCaptureNone\`{{global}} {{message}}\`;
        `,
      };

      let transformedModule = rewriteModule(ts, { script }, testEnvironment);

      expect(transformedModule?.errors).toEqual([]);
      expect(transformedModule?.transformedContents).toMatchInlineSnapshot(`
        "import { hbsCaptureAll, hbsCaptureSome, hbsCaptureNone } from '@norith/glint-test-env';

        const message = 'hello';

        ({} as typeof import(\\"@norith/glint-test-env\\")).templateExpression(function(𝚪, χ: typeof import(\\"@norith/glint-test-env\\")) {
          hbsCaptureAll;
          χ.emitContent(χ.resolveOrReturn(global)());
          χ.emitContent(χ.resolveOrReturn(message)());
          𝚪; χ;
        });
        ({} as typeof import(\\"@norith/glint-test-env\\")).templateExpression(function(𝚪, χ: typeof import(\\"@norith/glint-test-env\\")) {
          hbsCaptureSome;
          χ.emitContent(χ.resolveOrReturn(χ.Globals[\\"global\\"])());
          χ.emitContent(χ.resolveOrReturn(message)());
          𝚪; χ;
        });
        ({} as typeof import(\\"@norith/glint-test-env\\")).templateExpression(function(𝚪, χ: typeof import(\\"@norith/glint-test-env\\")) {
          hbsCaptureNone;
          χ.emitContent(χ.resolveOrReturn(χ.Globals[\\"global\\"])());
          χ.emitContent(χ.resolveOrReturn(χ.Globals[\\"message\\"])());
          𝚪; χ;
        });"
      `);
    });
  });

  describe('standalone companion template', () => {
    const emberLooseEnvironment = GlintEnvironment.load(`ember-loose`);

    test('with a simple class', () => {
      let script = {
        filename: 'test.ts',
        contents: stripIndent`
          import Component from '@glimmer/component';
          export default class MyComponent extends Component {
          }
        `,
      };

      let template = {
        filename: 'test.hbs',
        contents: stripIndent``,
      };

      let transformedModule = rewriteModule(ts, { script, template }, emberLooseEnvironment);

      expect(transformedModule?.errors).toEqual([]);
      expect(transformedModule?.transformedContents).toMatchInlineSnapshot(`
        "import Component from '@glimmer/component';
        export default class MyComponent extends Component {
        static {
        ({} as typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")) {
          𝚪; χ;
        })}
        }"
      `);
    });

    test('with a class that is separately exported', () => {
      let script = {
        filename: 'test.ts',
        contents: stripIndent`
          import Component from '@glimmer/component';
          class MyComponent extends Component {
          }
          export default MyComponent;
        `,
      };

      let template = {
        filename: 'test.hbs',
        contents: stripIndent``,
      };

      let transformedModule = rewriteModule(ts, { script, template }, emberLooseEnvironment);

      expect(transformedModule?.errors).toEqual([]);
      expect(transformedModule?.transformedContents).toMatchInlineSnapshot(`
        "import Component from '@glimmer/component';
        class MyComponent extends Component {
        static {
        ({} as typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")) {
          𝚪; χ;
        })}
        }
        export default MyComponent;"
      `);
    });

    test('with a class with type parameters', () => {
      let script = {
        filename: 'test.ts',
        contents: stripIndent`
          import Component from '@glimmer/component';
          export default class MyComponent<K extends string> extends Component<{ value: K }> {
          }
        `,
      };

      let template = {
        filename: 'test.hbs',
        contents: stripIndent``,
      };

      let transformedModule = rewriteModule(ts, { script, template }, emberLooseEnvironment);

      expect(transformedModule?.errors).toEqual([]);
      expect(transformedModule?.transformedContents).toMatchInlineSnapshot(`
        "import Component from '@glimmer/component';
        export default class MyComponent<K extends string> extends Component<{ value: K }> {
        static {
        ({} as typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")) {
          𝚪; χ;
        })}
        }"
      `);
    });

    test('with an anonymous class', () => {
      let script = {
        filename: 'test.ts',
        contents: stripIndent`
          import Component from '@glimmer/component';
          export default class extends Component {
          }
        `,
      };

      let template = {
        filename: 'test.hbs',
        contents: stripIndent``,
      };

      let transformedModule = rewriteModule(ts, { script, template }, emberLooseEnvironment);

      expect(transformedModule?.transformedContents).toMatchInlineSnapshot(`
        "import Component from '@glimmer/component';
        export default class extends Component {
        static {
        ({} as typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")) {
          𝚪; χ;
        })}
        }"
      `);
    });

    test('with no default export', () => {
      let script = {
        filename: 'test.ts',
        contents: stripIndent`
          import Component from '@glimmer/component';
          export class MyComponent extends Component {}
        `,
      };

      let template = {
        filename: 'test.hbs',
        contents: stripIndent`{{hello}}`,
      };

      let transformedModule = rewriteModule(ts, { script, template }, emberLooseEnvironment);

      expect(transformedModule?.errors).toEqual([]);
      expect(transformedModule?.transformedContents).toMatchInlineSnapshot(`
        "import Component from '@glimmer/component';
        export class MyComponent extends Component {}
        ({} as typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")).templateExpression(function(𝚪, χ: typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")) {
          χ.emitContent(χ.resolveOrReturn(χ.Globals[\\"hello\\"])());
          𝚪; χ;
        });
        "
      `);
    });

    test('with an opaque default export', () => {
      let script = {
        filename: 'test.ts',
        contents: stripIndent`
          import templateOnly from '@glimmer/component/template-only';

          export default templateOnly();
        `,
      };

      let template = {
        filename: 'test.hbs',
        contents: stripIndent``,
      };

      let transformedModule = rewriteModule(ts, { script, template }, emberLooseEnvironment);

      expect(transformedModule?.errors).toEqual([]);
      expect(transformedModule?.transformedContents).toMatchInlineSnapshot(`
        "import templateOnly from '@glimmer/component/template-only';

        export default templateOnly();
        ({} as typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")).templateForBackingValue(({} as unknown as typeof import('./test').default), function(𝚪, χ: typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")) {
          𝚪; χ;
        });
        "
      `);
    });

    test('with an opaque default export from JS file', () => {
      let script = {
        filename: 'test.js',
        contents: stripIndent`
          import templateOnly from '@glimmer/component/template-only';

          export default templateOnly();
        `,
      };

      let template = {
        filename: 'test.hbs',
        contents: stripIndent``,
      };

      let transformedModule = rewriteModule(ts, { script, template }, emberLooseEnvironment);

      expect(transformedModule?.errors).toEqual([]);
      expect(transformedModule?.transformedContents).toMatchInlineSnapshot(`
        "import templateOnly from '@glimmer/component/template-only';

        export default templateOnly();
        (/** @type {typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")} */ ({})).templateForBackingValue((/** @type {typeof import('./test').default} */ ({})), function(𝚪, /** @type {typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")} */ χ) {
          𝚪; χ;
        });
        "
      `);
    });

    test('with an unresolvable default export', () => {
      let script = {
        filename: 'test.ts',
        contents: stripIndent`
          export default Foo;
        `,
      };

      let template = {
        filename: 'test.hbs',
        contents: stripIndent`{{hello}}`,
      };

      let transformedModule = rewriteModule(ts, { script, template }, emberLooseEnvironment);

      expect(transformedModule?.errors).toEqual([]);
      expect(transformedModule?.transformedContents).toMatchInlineSnapshot(`
        "export default Foo;
        ({} as typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")).templateForBackingValue(({} as unknown as typeof import('./test').default), function(𝚪, χ: typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")) {
          χ.emitContent(χ.resolveOrReturn(χ.Globals[\\"hello\\"])());
          𝚪; χ;
        });
        "
      `);
    });

    test('with a class with default export in module augmentation', () => {
      let script = {
        filename: 'test.ts',
        contents: stripIndent`
          import Component from '@glimmer/component';
          export default class MyComponent extends Component {
          }
          declare module '@norith/glint-environment-ember-loose/registry' {
            export default interface Registry {
              Test: MyComponent;
            }
          }
        `,
      };

      let template = {
        filename: 'test.hbs',
        contents: stripIndent``,
      };

      let transformedModule = rewriteModule(ts, { script, template }, emberLooseEnvironment);

      expect(transformedModule?.errors).toEqual([]);
      expect(transformedModule?.transformedContents).toMatchInlineSnapshot(`
        "import Component from '@glimmer/component';
        export default class MyComponent extends Component {
        static {
        ({} as typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")) {
          𝚪; χ;
        })}
        }
        declare module '@norith/glint-environment-ember-loose/registry' {
          export default interface Registry {
            Test: MyComponent;
          }
        }"
      `);
    });

    test('with a syntax error', () => {
      let script = {
        filename: 'test.ts',
        contents: stripIndent`
          import Component from '@glimmer/component';
          export default class MyComponent extends Component {
          }
        `,
      };

      let template = {
        filename: 'test.hbs',
        contents: stripIndent`
          {{hello
        `,
      };

      let transformedModule = rewriteModule(ts, { script, template }, emberLooseEnvironment);

      expect(transformedModule?.errors.length).toBe(1);
      expect(transformedModule?.transformedContents).toMatchInlineSnapshot(`
        "import Component from '@glimmer/component';
        export default class MyComponent extends Component {
        static {
        ({} as typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")) {
          𝚪; χ;
        })}
        }"
      `);
    });
  });

  describe('ember-template-imports', () => {
    test('embedded gts templates', () => {
      let customEnv = GlintEnvironment.load(['ember-loose', 'ember-template-imports']);
      let script = {
        filename: 'foo.gts',
        contents: stripIndent`
          class MyComponent {
            <template>
              Hello, {{this.target}}!
            </template>

            private target = 'World';
          }
        `,
      };

      let rewritten = rewriteModule(ts, { script }, customEnv);
      let roundTripOffset = (offset: number): number | undefined =>
        rewritten?.getOriginalOffset(rewritten.getTransformedOffset(script.filename, offset))
          .offset;

      let classOffset = script.contents.indexOf('MyComponent');
      let accessOffset = script.contents.indexOf('this.target');
      let fieldOffset = script.contents.indexOf('private target');

      expect(roundTripOffset(classOffset)).toEqual(classOffset);
      expect(roundTripOffset(accessOffset)).toEqual(accessOffset);
      expect(roundTripOffset(fieldOffset)).toEqual(fieldOffset);

      expect(rewritten?.toDebugString()).toMatchInlineSnapshot(`
        "TransformedModule

        | Mapping: TemplateEmbedding
        |  hbs(22:74):   <template>\\\\n    Hello, {{this.target}}!\\\\n  </template>
        |  ts(22:313):   static { ({} as typeof import(\\"@norith/glint-environment-ember-template-imports/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-ember-template-imports/-private/dsl\\")) {\\\\n  χ.emitContent(χ.resolveOrReturn(𝚪.this.target)());\\\\n  𝚪; χ;\\\\n}) }
        |
        | | Mapping: Template
        | |  hbs(32:63):   Hello, {{this.target}}!
        | |  ts(246:300):  χ.emitContent(χ.resolveOrReturn(𝚪.this.target)());
        | |
        | | | Mapping: TextContent
        | | |  hbs(37:43):   Hello,
        | | |  ts(246:246):
        | | |
        | | | Mapping: MustacheStatement
        | | |  hbs(44:59):   {{this.target}}
        | | |  ts(246:298):  χ.emitContent(χ.resolveOrReturn(𝚪.this.target)())
        | | |
        | | | | Mapping: PathExpression
        | | | |  hbs(46:57):   this.target
        | | | |  ts(280:294):  𝚪.this.target
        | | | |
        | | | | | Mapping: Identifier
        | | | | |  hbs(46:50):   this
        | | | | |  ts(283:287):  this
        | | | | |
        | | | | | Mapping: Identifier
        | | | | |  hbs(51:57):   target
        | | | | |  ts(288:294):  target
        | | | | |
        | | | |
        | | |
        | | | Mapping: TextContent
        | | |  hbs(59:60):   !
        | | |  ts(300:300):
        | | |
        | |
        |"
      `);
    });

    test('implicit default export', () => {
      let customEnv = GlintEnvironment.load(['ember-loose', 'ember-template-imports']);
      let script = {
        filename: 'foo.gts',
        contents: stripIndent`
          <template>
            Hello, {{@target}}!
          </template>
        `,
      };

      expect(rewriteModule(ts, { script }, customEnv)?.toDebugString()).toMatchInlineSnapshot(`
        "TransformedModule

        | Mapping: TemplateEmbedding
        |  hbs(0:44):    <template>\\\\n  Hello, {{@target}}!\\\\n</template>
        |  ts(0:284):    export default ({} as typeof import(\\"@norith/glint-environment-ember-template-imports/-private/dsl\\")).templateExpression(function(𝚪, χ: typeof import(\\"@norith/glint-environment-ember-template-imports/-private/dsl\\")) {\\\\n  χ.emitContent(χ.resolveOrReturn(𝚪.args.target)());\\\\n  𝚪; χ;\\\\n})
        |
        | | Mapping: Template
        | |  hbs(10:33):   Hello, {{@target}}!
        | |  ts(219:273):  χ.emitContent(χ.resolveOrReturn(𝚪.args.target)());
        | |
        | | | Mapping: TextContent
        | | |  hbs(13:19):   Hello,
        | | |  ts(219:219):
        | | |
        | | | Mapping: MustacheStatement
        | | |  hbs(20:31):   {{@target}}
        | | |  ts(219:271):  χ.emitContent(χ.resolveOrReturn(𝚪.args.target)())
        | | |
        | | | | Mapping: PathExpression
        | | | |  hbs(22:29):   @target
        | | | |  ts(253:267):  𝚪.args.target
        | | | |
        | | | | | Mapping: Identifier
        | | | | |  hbs(23:29):   target
        | | | | |  ts(261:267):  target
        | | | | |
        | | | |
        | | |
        | | | Mapping: TextContent
        | | |  hbs(31:32):   !
        | | |  ts(273:273):
        | | |
        | |
        |"
      `);
    });

    test('mixed expression and class uses', () => {
      let customEnv = GlintEnvironment.load(['ember-loose', 'ember-template-imports']);
      let script = {
        filename: 'foo.gts',
        contents: stripIndent`
          import Component from '@glimmer/component';
          console.log(<template>{{@message}}</template>);
          export class MyComponent extends Component {
            <template>{{this.title}}</template>
          }
        `,
      };

      let rewritten = rewriteModule(ts, { script }, customEnv);
      let roundTripOffset = (offset: number): number | undefined =>
        rewritten?.getOriginalOffset(rewritten.getTransformedOffset(script.filename, offset))
          .offset;

      let classOffset = script.contents.indexOf('MyComponent');
      let firstTemplateOffset = script.contents.indexOf('@message');
      let secondTemplateOffset = script.contents.indexOf('this.title');

      expect(roundTripOffset(classOffset)).toEqual(classOffset);
      expect(roundTripOffset(firstTemplateOffset)).toEqual(firstTemplateOffset);
      expect(roundTripOffset(secondTemplateOffset)).toEqual(secondTemplateOffset);

      expect(rewritten?.toDebugString()).toMatchInlineSnapshot(`
        "TransformedModule

        | Mapping: TemplateEmbedding
        |  hbs(56:89):   <template>{{@message}}</template>
        |  ts(56:326):   ({} as typeof import(\\"@norith/glint-environment-ember-template-imports/-private/dsl\\")).templateExpression(function(𝚪, χ: typeof import(\\"@norith/glint-environment-ember-template-imports/-private/dsl\\")) {\\\\n  χ.emitContent(χ.resolveOrReturn(𝚪.args.message)());\\\\n  𝚪; χ;\\\\n})
        |
        | | Mapping: Template
        | |  hbs(66:78):   {{@message}}
        | |  ts(260:315):  χ.emitContent(χ.resolveOrReturn(𝚪.args.message)());
        | |
        | | | Mapping: MustacheStatement
        | | |  hbs(66:78):   {{@message}}
        | | |  ts(260:313):  χ.emitContent(χ.resolveOrReturn(𝚪.args.message)())
        | | |
        | | | | Mapping: PathExpression
        | | | |  hbs(68:76):   @message
        | | | |  ts(294:309):  𝚪.args.message
        | | | |
        | | | | | Mapping: Identifier
        | | | | |  hbs(69:76):   message
        | | | | |  ts(302:309):  message
        | | | | |
        | | | |
        | | |
        | |
        |

        | Mapping: TemplateEmbedding
        |  hbs(139:174): <template>{{this.title}}</template>
        |  ts(376:666):  static { ({} as typeof import(\\"@norith/glint-environment-ember-template-imports/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-ember-template-imports/-private/dsl\\")) {\\\\n  χ.emitContent(χ.resolveOrReturn(𝚪.this.title)());\\\\n  𝚪; χ;\\\\n}) }
        |
        | | Mapping: Template
        | |  hbs(149:163): {{this.title}}
        | |  ts(600:653):  χ.emitContent(χ.resolveOrReturn(𝚪.this.title)());
        | |
        | | | Mapping: MustacheStatement
        | | |  hbs(149:163): {{this.title}}
        | | |  ts(600:651):  χ.emitContent(χ.resolveOrReturn(𝚪.this.title)())
        | | |
        | | | | Mapping: PathExpression
        | | | |  hbs(151:161): this.title
        | | | |  ts(634:647):  𝚪.this.title
        | | | |
        | | | | | Mapping: Identifier
        | | | | |  hbs(151:155): this
        | | | | |  ts(637:641):  this
        | | | | |
        | | | | | Mapping: Identifier
        | | | | |  hbs(156:161): title
        | | | | |  ts(642:647):  title
        | | | | |
        | | | |
        | | |
        | |
        |"
      `);
    });

    test('with imported special forms', () => {
      let env = GlintEnvironment.load(['ember-loose', 'ember-template-imports']);
      let script = {
        filename: 'foo.gts',
        contents: stripIndent`
          import { array as arr, hash as h } from '@ember/helper';

          <template>
            {{! Intentionally shadowing }}
            {{#let (arr 1 2) (h red="blue") as |arr h|}}
              Array is {{arr}}
              Hash is {{h}}
            {{/let}}
          </template>
        `,
      };

      expect(rewriteModule(ts, { script }, env)?.toDebugString()).toMatchInlineSnapshot(`
        "TransformedModule

        | Mapping: TemplateEmbedding
        |  hbs(58:210):  <template>\\\\n  {{! Intentionally shadowing }}\\\\n  {{#let (arr 1 2) (h red=\\"blue\\") as |arr h|}}\\\\n    Array is {{arr}}\\\\n    Hash is {{h}}\\\\n  {{/let}}\\\\n</template>
        |  ts(58:599):   export default ({} as typeof import(\\"@norith/glint-environment-ember-template-imports/-private/dsl\\")).templateExpression(function(𝚪, χ: typeof import(\\"@norith/glint-environment-ember-template-imports/-private/dsl\\")) {\\\\n  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"let\\"])((χ.noop(arr), [1, 2]), (χ.noop(h), ({\\\\n      red: \\"blue\\",\\\\n    }))));\\\\n    {\\\\n      const [arr, h] = 𝛄.blockParams[\\"default\\"];\\\\n      χ.emitContent(χ.resolveOrReturn(arr)());\\\\n      χ.emitContent(χ.resolveOrReturn(h)());\\\\n    }\\\\n    χ.Globals[\\"let\\"];\\\\n  }\\\\n  𝚪; χ;\\\\n})
        |
        | | Mapping: Template
        | |  hbs(68:199):  {{! Intentionally shadowing }}\\\\n  {{#let (arr 1 2) (h red=\\"blue\\") as |arr h|}}\\\\n    Array is {{arr}}\\\\n    Hash is {{h}}\\\\n  {{/let}}
        | |  ts(277:588):  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"let\\"])((χ.noop(arr), [1, 2]), (χ.noop(h), ({\\\\n      red: \\"blue\\",\\\\n    }))));\\\\n    {\\\\n      const [arr, h] = 𝛄.blockParams[\\"default\\"];\\\\n      χ.emitContent(χ.resolveOrReturn(arr)());\\\\n      χ.emitContent(χ.resolveOrReturn(h)());\\\\n    }\\\\n    χ.Globals[\\"let\\"];\\\\n  }
        | |
        | | | Mapping: TextContent
        | | |  hbs(68:69):
        | | |  ts(277:277):
        | | |
        | | | Mapping: MustacheCommentStatement
        | | |  hbs(71:101):  {{! Intentionally shadowing }}
        | | |  ts(277:277):
        | | |
        | | | Mapping: BlockStatement
        | | |  hbs(104:198): {{#let (arr 1 2) (h red=\\"blue\\") as |arr h|}}\\\\n    Array is {{arr}}\\\\n    Hash is {{h}}\\\\n  {{/let}}
        | | |  ts(277:587):  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"let\\"])((χ.noop(arr), [1, 2]), (χ.noop(h), ({\\\\n      red: \\"blue\\",\\\\n    }))));\\\\n    {\\\\n      const [arr, h] = 𝛄.blockParams[\\"default\\"];\\\\n      χ.emitContent(χ.resolveOrReturn(arr)());\\\\n      χ.emitContent(χ.resolveOrReturn(h)());\\\\n    }\\\\n    χ.Globals[\\"let\\"];\\\\n  }
        | | |
        | | | | Mapping: PathExpression
        | | | |  hbs(107:110): let
        | | | |  ts(322:338):  χ.Globals[\\"let\\"]
        | | | |
        | | | | | Mapping: Identifier
        | | | | |  hbs(107:110): let
        | | | | |  ts(333:336):  let
        | | | | |
        | | | |
        | | | | Mapping: PathExpression
        | | | |  hbs(112:115): arr
        | | | |  ts(348:351):  arr
        | | | |
        | | | | | Mapping: Identifier
        | | | | |  hbs(112:115): arr
        | | | | |  ts(348:351):  arr
        | | | | |
        | | | |
        | | | | Mapping: SubExpression
        | | | |  hbs(111:120): (arr 1 2)
        | | | |  ts(354:360):  [1, 2]
        | | | |
        | | | | | Mapping: NumberLiteral
        | | | | |  hbs(116:117): 1
        | | | | |  ts(355:356):  1
        | | | | |
        | | | | | Mapping: NumberLiteral
        | | | | |  hbs(118:119): 2
        | | | | |  ts(358:359):  2
        | | | | |
        | | | |
        | | | | Mapping: PathExpression
        | | | |  hbs(122:123): h
        | | | |  ts(371:372):  h
        | | | |
        | | | | | Mapping: Identifier
        | | | | |  hbs(122:123): h
        | | | | |  ts(371:372):  h
        | | | | |
        | | | |
        | | | | Mapping: SubExpression
        | | | |  hbs(121:135): (h red=\\"blue\\")
        | | | |  ts(375:403):  ({\\\\n      red: \\"blue\\",\\\\n    })
        | | | |
        | | | | | Mapping: Identifier
        | | | | |  hbs(124:127): red
        | | | | |  ts(384:387):  red
        | | | | |
        | | | | | Mapping: StringLiteral
        | | | | |  hbs(128:134): \\"blue\\"
        | | | | |  ts(389:395):  \\"blue\\"
        | | | | |
        | | | |
        | | | | Mapping: Identifier
        | | | |  hbs(140:143): arr
        | | | |  ts(427:430):  arr
        | | | |
        | | | | Mapping: Identifier
        | | | |  hbs(144:145): h
        | | | |  ts(432:433):  h
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(153:161): Array is
        | | | |  ts(464:464):
        | | | |
        | | | | Mapping: MustacheStatement
        | | | |  hbs(162:169): {{arr}}
        | | | |  ts(464:509):  χ.emitContent(χ.resolveOrReturn(arr)())
        | | | |
        | | | | | Mapping: PathExpression
        | | | | |  hbs(164:167): arr
        | | | | |  ts(502:505):  arr
        | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(164:167): arr
        | | | | | |  ts(502:505):  arr
        | | | | | |
        | | | | |
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(174:181): Hash is
        | | | |  ts(511:511):
        | | | |
        | | | | Mapping: MustacheStatement
        | | | |  hbs(182:187): {{h}}
        | | | |  ts(511:554):  χ.emitContent(χ.resolveOrReturn(h)())
        | | | |
        | | | | | Mapping: PathExpression
        | | | | |  hbs(184:185): h
        | | | | |  ts(549:550):  h
        | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(184:185): h
        | | | | | |  ts(549:550):  h
        | | | | | |
        | | | | |
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(187:188):
        | | | |  ts(556:556):
        | | | |
        | | | | Mapping: Identifier
        | | | |  hbs(193:196): let
        | | | |  ts(577:580):  let
        | | | |
        | | |
        | |
        |"
      `);
    });
  });
});
