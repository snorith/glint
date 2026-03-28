import { stripIndent } from 'common-tags';
import { describe, test, expect } from 'vitest';
import {
  templateToTypescript,
  TemplateToTypescriptOptions,
} from '../../src/transform/template/template-to-typescript.js';

describe('Transform: rewriteTemplate', () => {
  // Slices out the template boilerplate to return only the code representing
  // the body, to keep snapshots brief and focused.
  function templateBody(
    template: string,
    options: Omit<TemplateToTypescriptOptions, 'typesModule'> = {}
  ): string {
    let { result, errors } = templateToTypescript(template, {
      typesModule: '@norith/glint-template',
      ...options,
    });
    if (errors.length) {
      throw new Error('Unexpected error(s): ' + errors.map((e) => e.message).join(', '));
    }

    return (result?.code ?? '')
      .split('\n')
      .slice(1, -2)
      .join('\n')
      .replace(/(^|\n) {2}/g, '$1');
  }

  describe('template boilerplate', () => {
    test('without any specified type parameters or context type', () => {
      expect(templateToTypescript('', { typesModule: '@norith/glint-template' }).result?.code)
        .toMatchInlineSnapshot(`
          "({} as typeof import(\\"@norith/glint-template\\")).templateExpression(function(𝚪, χ: typeof import(\\"@norith/glint-template\\")) {
            𝚪; χ;
          })"
        `);
    });

    test('given a backing value', () => {
      expect(
        templateToTypescript('', { backingValue: 'someValue', typesModule: '@norith/glint-template' })
          .result?.code
      ).toMatchInlineSnapshot(`
        "({} as typeof import(\\"@norith/glint-template\\")).templateForBackingValue(someValue, function(𝚪, χ: typeof import(\\"@norith/glint-template\\")) {
          𝚪; χ;
        })"
      `);
    });

    test('given preamble code', () => {
      let preamble = ['console.log("hello!");', 'throw new Error();'];

      expect(templateToTypescript('', { preamble, typesModule: '@norith/glint-template' }).result?.code)
        .toMatchInlineSnapshot(`
          "({} as typeof import(\\"@norith/glint-template\\")).templateExpression(function(𝚪, χ: typeof import(\\"@norith/glint-template\\")) {
            console.log(\\"hello!\\");
            throw new Error();
            𝚪; χ;
          })"
        `);
    });
  });

  describe('directives', () => {
    test('in a top-level mustache', () => {
      let template = stripIndent`
        {{! @glint-ignore: this is fine }}
        <Foo as |bar|>
          {{hello}}
        </Foo>
      `;

      let { result, errors } = templateToTypescript(template, { typesModule: '@norith/glint-template' });

      expect(errors).toEqual([]);
      expect(result?.directives).toEqual([
        {
          kind: 'ignore',
          location: {
            start: template.indexOf('{{!'),
            end: template.indexOf('fine }}') + 'fine }}'.length,
          },
          areaOfEffect: {
            start: template.indexOf('<Foo as'),
            end: template.indexOf('|bar|>') + '|bar|>'.length + 1,
          },
        },
      ]);
    });

    test('in an element bobdy', () => {
      let template = stripIndent`
        <Foo
          {{! @glint-ignore: this is fine }}
          @arg="hi"
          as |bar|
        >
          {{hello}}
        </Foo>
      `;

      let { result, errors } = templateToTypescript(template, { typesModule: '@norith/glint-template' });

      expect(errors).toEqual([]);
      expect(result?.directives).toEqual([
        {
          kind: 'ignore',
          location: {
            start: template.indexOf('{{!'),
            end: template.indexOf('fine }}') + 'fine }}'.length,
          },
          areaOfEffect: {
            start: template.indexOf('  @arg='),
            end: template.indexOf('"hi"') + '"hi"'.length + 1,
          },
        },
      ]);
    });

    test('nocheck', () => {
      let template = stripIndent`
        {{! @glint-nocheck: don't check this whole template }}
        <Foo />
        {{foo-bar}}
        {{this.baz}}
      `;

      let { result, errors } = templateToTypescript(template, { typesModule: '@norith/glint-template' });

      expect(errors).toEqual([]);
      expect(result?.directives).toEqual([
        {
          kind: 'ignore',
          location: {
            start: 0,
            end: template.indexOf('template }}') + 'template }}'.length,
          },
          areaOfEffect: {
            start: 0,
            end: template.length - 1,
          },
        },
      ]);
      expect(templateBody(template)).toMatchInlineSnapshot(`
        "// @glint-nocheck
        {
          const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"Foo\\"])());
          𝛄;
        }
        χ.emitContent(χ.resolveOrReturn(χ.Globals[\\"foo-bar\\"])());
        χ.emitContent(χ.resolveOrReturn(𝚪.this.baz)());"
      `);
    });

    test('expect-error', () => {
      let template = stripIndent`
        {{! @glint-expect-error: this is fine }}
        <Foo as |bar|>
          {{hello}}
        </Foo>
      `;

      let { result, errors } = templateToTypescript(template, { typesModule: '@norith/glint-template' });

      expect(errors).toEqual([]);
      expect(result?.directives).toEqual([
        {
          kind: 'expect-error',
          location: {
            start: template.indexOf('{{!'),
            end: template.indexOf('fine }}') + 'fine }}'.length,
          },
          areaOfEffect: {
            start: template.indexOf('<Foo as'),
            end: template.indexOf('|bar|>') + '|bar|>'.length + 1,
          },
        },
      ]);
    });

    test('unknown type', () => {
      let template = stripIndent`
        {{! @glint-check }}
        <Foo as |bar|>
          {{hello}}
        </Foo>
      `;

      let { result, errors } = templateToTypescript(template, { typesModule: '@norith/glint-template' });

      expect(result?.directives).toEqual([]);
      expect(errors).toEqual([
        {
          message: 'Unknown directive @glint-check',
          location: {
            start: template.indexOf('{{!'),
            end: template.indexOf('}}') + '}}'.length,
          },
        },
      ]);
    });
  });

  describe('special forms', () => {
    describe('symbol consumption', () => {
      test('implicit globals are ignored in statement position', () => {
        let body = templateBody(`{{#t true}}{{/t}}`, {
          specialForms: { t: 'if' },
        });

        expect(body).toMatchInlineSnapshot(`
          "if (true) {
          }"
        `);
      });

      test('implicit globals are ignored in expression position', () => {
        let body = templateBody(`{{obj x=123}}`, {
          specialForms: { obj: 'object-literal' },
        });

        expect(body).toMatchInlineSnapshot(`
          "({
            x: 123,
          });"
        `);
      });

      test('explicit globals are ignored in statement position', () => {
        let body = templateBody(`{{#t true}}{{/t}}`, {
          specialForms: { t: 'if' },
          globals: ['t'],
        });

        expect(body).toMatchInlineSnapshot(`
          "if (true) {
          }"
        `);
      });

      test('explicit globals are ignored in expression position', () => {
        let body = templateBody(`{{obj x=123}}`, {
          specialForms: { obj: 'object-literal' },
          globals: ['obj'],
        });

        expect(body).toMatchInlineSnapshot(`
          "({
            x: 123,
          });"
        `);
      });

      test('outer-scope values are consumed statement position', () => {
        let body = templateBody(`{{#t true}}{{/t}}`, {
          specialForms: { t: 'if' },
          globals: [],
        });

        expect(body).toMatchInlineSnapshot(`
          "t;
          if (true) {
          }"
        `);
      });

      test('outer-scope values are consumed in expression position', () => {
        let body = templateBody(`{{obj x=123}}`, {
          specialForms: { obj: 'object-literal' },
          globals: [],
        });

        expect(body).toMatchInlineSnapshot(`
          "(χ.noop(obj), ({
            x: 123,
          }));"
        `);
      });
    });

    describe('{{if}}', () => {
      test('without an alternate', () => {
        let template = '{{testIf @foo "ok"}}';
        let specialForms = { testIf: 'if' } as const;

        expect(templateBody(template, { specialForms })).toMatchInlineSnapshot(
          `"(𝚪.args.foo) ? (\\"ok\\") : (undefined);"`
        );
      });

      test('with an alternate', () => {
        let template = '{{testIf @foo "ok" "nope"}}';
        let specialForms = { testIf: 'if' } as const;

        expect(templateBody(template, { specialForms })).toMatchInlineSnapshot(
          `"(𝚪.args.foo) ? (\\"ok\\") : (\\"nope\\");"`
        );
      });
    });

    describe('{{unless}}', () => {
      test('without an alternate', () => {
        let template = '{{testUnless @foo "ok"}}';
        let specialForms = { testUnless: 'if-not' } as const;

        expect(templateBody(template, { specialForms })).toMatchInlineSnapshot(
          `"!(𝚪.args.foo) ? (\\"ok\\") : (undefined);"`
        );
      });

      test('with an alternate', () => {
        let template = '{{testUnless @foo "ok" "nope"}}';
        let specialForms = { testUnless: 'if-not' } as const;

        expect(templateBody(template, { specialForms })).toMatchInlineSnapshot(
          `"!(𝚪.args.foo) ? (\\"ok\\") : (\\"nope\\");"`
        );
      });
    });

    describe('{{#if}}', () => {
      test('without an {{else}}', () => {
        let template = stripIndent`
          {{#testIf @foo}}
            {{@ok}}
          {{/testIf}}
        `;

        let specialForms = { testIf: 'if' } as const;

        expect(templateBody(template, { specialForms })).toMatchInlineSnapshot(`
          "if (𝚪.args.foo) {
            χ.emitContent(χ.resolveOrReturn(𝚪.args.ok)());
          }"
        `);
      });

      test('with an {{else}}', () => {
        let template = stripIndent`
          {{#testIf @foo}}
            {{@ok}}
          {{else}}
            {{@noGood}}
          {{/testIf}}
        `;

        let specialForms = { testIf: 'if' } as const;

        expect(templateBody(template, { specialForms })).toMatchInlineSnapshot(`
          "if (𝚪.args.foo) {
            χ.emitContent(χ.resolveOrReturn(𝚪.args.ok)());
          } else {
            χ.emitContent(χ.resolveOrReturn(𝚪.args.noGood)());
          }"
        `);
      });

      test('with {{else if ...}}', () => {
        let template = stripIndent`
          {{#testIf @foo}}
            {{@ok}}
          {{else testIf @bar}}
            {{@noGood}}
          {{else}}
            {{@done}}
          {{/testIf}}
        `;

        let specialForms = { testIf: 'if' } as const;

        expect(templateBody(template, { specialForms })).toMatchInlineSnapshot(`
          "if (𝚪.args.foo) {
            χ.emitContent(χ.resolveOrReturn(𝚪.args.ok)());
          } else {
            if (𝚪.args.bar) {
              χ.emitContent(χ.resolveOrReturn(𝚪.args.noGood)());
            } else {
              χ.emitContent(χ.resolveOrReturn(𝚪.args.done)());
            }
          }"
        `);
      });

      test('with {{else someOtherIdentifier}}', () => {
        let template = stripIndent`
          {{#testIf @foo}}
            {{@ok}}
          {{else doAThing as |ok|}}
            {{ok}}
          {{else}}
            {{@nevermind}}
          {{/testIf}}
        `;

        let specialForms = { testIf: 'if' } as const;

        expect(templateBody(template, { specialForms })).toMatchInlineSnapshot(`

          "if (𝚪.args.foo) {
            χ.emitContent(χ.resolveOrReturn(𝚪.args.ok)());
          } else {
            {
              const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"doAThing\\"])());
              {
                const [ok] = 𝛄.blockParams[\\"default\\"];
                χ.emitContent(χ.resolveOrReturn(ok)());
              }
              {
                const [] = 𝛄.blockParams[\\"else\\"];
                χ.emitContent(χ.resolveOrReturn(𝚪.args.nevermind)());
              }
              χ.Globals[\\"doAThing\\"];
            }
          }"
        `);
      });
    });

    describe('{{#unless}}', () => {
      test('without an {{else}}', () => {
        let template = stripIndent`
          {{#testUnless @foo}}
            {{@ok}}
          {{/testUnless}}
        `;

        let specialForms = { testUnless: 'if-not' } as const;

        expect(templateBody(template, { specialForms })).toMatchInlineSnapshot(`
          "if (!(𝚪.args.foo)) {
            χ.emitContent(χ.resolveOrReturn(𝚪.args.ok)());
          }"
        `);
      });

      test('with an {{else}}', () => {
        let template = stripIndent`
          {{#testUnless @foo}}
            {{@ok}}
          {{else}}
            {{@noGood}}
          {{/testUnless}}
        `;

        let specialForms = { testUnless: 'if-not' } as const;

        expect(templateBody(template, { specialForms })).toMatchInlineSnapshot(`
          "if (!(𝚪.args.foo)) {
            χ.emitContent(χ.resolveOrReturn(𝚪.args.ok)());
          } else {
            χ.emitContent(χ.resolveOrReturn(𝚪.args.noGood)());
          }"
        `);
      });
    });

    describe('{{yield}}', () => {
      test('default {{yield}}', () => {
        let template = stripIndent`
          {{testYield 123 this.message}}
        `;

        let specialForms = { testYield: 'yield' } as const;

        expect(templateBody(template, { specialForms })).toMatchInlineSnapshot(
          '"χ.yieldToBlock(𝚪, \\"default\\")(123, 𝚪.this.message);"'
        );
      });

      test('{{yield}} to a named block', () => {
        let template = stripIndent`
          {{testYield 123 to="body"}}
        `;

        let specialForms = { testYield: 'yield' } as const;

        expect(templateBody(template, { specialForms })).toMatchInlineSnapshot(
          '"χ.yieldToBlock(𝚪, \\"body\\")(123);"'
        );
      });

      test('{{yield}} to else', () => {
        let template = stripIndent`
          {{testYield 123 to="else"}}
        `;

        let specialForms = { testYield: 'yield' } as const;

        expect(templateBody(template, { specialForms })).toMatchInlineSnapshot(
          '"χ.yieldToBlock(𝚪, \\"else\\")(123);"'
        );
      });

      test('{{yield}} to inverse', () => {
        let template = stripIndent`
          {{testYield 123 to="inverse"}}
        `;

        let specialForms = { testYield: 'yield' } as const;

        expect(templateBody(template, { specialForms })).toMatchInlineSnapshot(
          '"χ.yieldToBlock(𝚪, \\"else\\")(123);"'
        );
      });
    });

    describe('{{array}}', () => {
      test('without values', () => {
        let template = stripIndent`
          {{testArray}}
        `;

        let specialForms = { testArray: 'array-literal' } as const;

        expect(templateBody(template, { globals: [], specialForms })).toMatchInlineSnapshot(
          '"(χ.noop(testArray), []);"'
        );
      });

      test('with values', () => {
        let template = stripIndent`
          {{testArray 1 true "free"}}
        `;

        let specialForms = { testArray: 'array-literal' } as const;

        expect(templateBody(template, { globals: [], specialForms })).toMatchInlineSnapshot(
          '"(χ.noop(testArray), [1, true, \\"free\\"]);"'
        );
      });

      test('within a subexpression', () => {
        let template = stripIndent`
          {{log (testArray 1 true "free")}}
        `;

        let specialForms = { testArray: 'array-literal' } as const;

        expect(templateBody(template, { globals: [], specialForms })).toMatchInlineSnapshot(
          '"χ.emitContent(χ.resolve(log)((χ.noop(testArray), [1, true, \\"free\\"])));"'
        );
      });
    });

    describe('{{hash}}', () => {
      test('without values', () => {
        let template = stripIndent`
          {{testHash}}
        `;

        let specialForms = { testHash: 'object-literal' } as const;

        expect(templateBody(template, { globals: [], specialForms })).toMatchInlineSnapshot(
          '"(χ.noop(testHash), {});"'
        );
      });

      test('with values', () => {
        let template = stripIndent`
          {{testHash a=1 b="ok"}}
        `;

        let specialForms = { testHash: 'object-literal' } as const;

        expect(templateBody(template, { globals: [], specialForms })).toMatchInlineSnapshot(`
          "(χ.noop(testHash), ({
            a: 1,
            b: \\"ok\\",
          }));"
        `);
      });

      test('within a subexpression', () => {
        let template = stripIndent`
          {{log (testHash a=1 b="ok")}}
        `;

        let specialForms = { testHash: 'object-literal' } as const;

        expect(templateBody(template, { globals: [], specialForms })).toMatchInlineSnapshot(`
          "χ.emitContent(χ.resolve(log)((χ.noop(testHash), ({
            a: 1,
            b: \\"ok\\",
          }))));"
        `);
      });
    });

    describe('{{eq}}', () => {
      test('emits ===', () => {
        let template = stripIndent`
          {{log (testEq 1 2)}}
        `;

        expect(templateBody(template, { globals: ['testEq'], specialForms: { testEq: '===' } }))
          .toMatchInlineSnapshot(`
          "χ.emitContent(χ.resolve(log)((1 === 2)));"
        `);
      });
    });

    describe('{{neq}}', () => {
      test('emits !==', () => {
        let template = stripIndent`
          {{log (testNeq 1 2)}}
        `;

        expect(templateBody(template, { globals: ['testNeq'], specialForms: { testNeq: '!==' } }))
          .toMatchInlineSnapshot(`
          "χ.emitContent(χ.resolve(log)((1 !== 2)));"
        `);
      });
    });

    describe('{{and}}', () => {
      test('with two arguments', () => {
        let template = stripIndent`
        {{log (testAnd 1 2)}}
        `;

        expect(templateBody(template, { globals: ['testAnd'], specialForms: { testAnd: '&&' } }))
          .toMatchInlineSnapshot(`
        "χ.emitContent(χ.resolve(log)((1 && 2)));"
        `);
      });

      test('with three arguments', () => {
        let template = stripIndent`
        {{log (testAnd 1 2 3)}}
        `;

        expect(templateBody(template, { globals: ['testAnd'], specialForms: { testAnd: '&&' } }))
          .toMatchInlineSnapshot(`
        "χ.emitContent(χ.resolve(log)((1 && 2 && 3)));"
        `);
      });
    });

    describe('{{or}}', () => {
      test('with two arguments', () => {
        let template = stripIndent`
        {{log (testOr 1 2)}}
        `;

        expect(templateBody(template, { globals: ['testOr'], specialForms: { testOr: '||' } }))
          .toMatchInlineSnapshot(`
        "χ.emitContent(χ.resolve(log)((1 || 2)));"
        `);
      });

      test('with three arguments', () => {
        let template = stripIndent`
        {{log (testOr 1 2 3)}}
        `;

        expect(templateBody(template, { globals: ['testOr'], specialForms: { testOr: '||' } }))
          .toMatchInlineSnapshot(`
        "χ.emitContent(χ.resolve(log)((1 || 2 || 3)));"
        `);
      });
    });

    describe('{{not}}', () => {
      test('with one argument', () => {
        let template = stripIndent`
        {{log (testNot 1)}}
        `;

        expect(templateBody(template, { globals: ['testNot'], specialForms: { testNot: '!' } }))
          .toMatchInlineSnapshot(`
        "χ.emitContent(χ.resolve(log)(!1));"
        `);
      });
    });
  });

  describe('inline curlies', () => {
    describe('paths', () => {
      describe('path types', () => {
        test('out-of-scope identifier', () => {
          let template = '{{message}}';

          expect(templateBody(template)).toMatchInlineSnapshot(
            '"χ.emitContent(χ.resolveOrReturn(χ.Globals[\\"message\\"])());"'
          );
        });

        test('in-scope identifier', () => {
          let template = '{{message}}';

          expect(templateBody(template, { globals: [] })).toMatchInlineSnapshot(
            '"χ.emitContent(χ.resolveOrReturn(message)());"'
          );
        });

        test('chained path', () => {
          let template = '{{obj.foo.bar}}';

          expect(templateBody(template, { globals: [] })).toMatchInlineSnapshot(
            '"χ.emitContent(χ.resolveOrReturn(obj?.foo?.bar)());"'
          );
        });

        test('chained path with a spinal-case key', () => {
          let template = '{{obj.foo-bar.baz}}';

          expect(templateBody(template, { globals: [] })).toMatchInlineSnapshot(
            '"χ.emitContent(χ.resolveOrReturn(obj?.[\\"foo-bar\\"]?.baz)());"'
          );
        });

        test('`this` path', () => {
          let template = '{{this}}';

          expect(templateBody(template)).toMatchInlineSnapshot(
            '"χ.emitContent(χ.resolveOrReturn(𝚪.this)());"'
          );
        });

        test('chained `this` path', () => {
          let template = '{{this.foo.bar}}';

          expect(templateBody(template)).toMatchInlineSnapshot(
            '"χ.emitContent(χ.resolveOrReturn(𝚪.this.foo?.bar)());"'
          );
        });

        test('chained `this` path with a spinal-case key', () => {
          let template = '{{this.foo-bar}}';

          expect(templateBody(template)).toMatchInlineSnapshot(
            '"χ.emitContent(χ.resolveOrReturn(𝚪.this[\\"foo-bar\\"])());"'
          );
        });

        test('`@arg` path', () => {
          let template = '{{@foo}}';

          expect(templateBody(template)).toMatchInlineSnapshot(
            '"χ.emitContent(χ.resolveOrReturn(𝚪.args.foo)());"'
          );
        });

        test('`@arg` path with a spinal-case name', () => {
          let template = '{{@foo-bar}}';

          expect(templateBody(template)).toMatchInlineSnapshot(
            '"χ.emitContent(χ.resolveOrReturn(𝚪.args[\\"foo-bar\\"])());"'
          );
        });

        test('passed as an attr', () => {
          let template = '<Foo data-bar={{helper param=true}} />';

          expect(templateBody(template, { globals: [] })).toMatchInlineSnapshot(`
            "{
              const 𝛄 = χ.emitComponent(χ.resolve(Foo)());
              χ.applyAttributes(𝛄.element, {
                \\"data-bar\\": χ.resolve(helper)({ param: true , ...χ.NamedArgsMarker }),
              });
            }"
          `);
        });

        test('passed as an @arg', () => {
          let template = '<Foo @bar={{helper param=true}} />';

          expect(templateBody(template, { globals: [] })).toMatchInlineSnapshot(`
            "{
              const 𝛄 = χ.emitComponent(χ.resolve(Foo)({ bar: χ.resolve(helper)({ param: true , ...χ.NamedArgsMarker }), ...χ.NamedArgsMarker }));
              𝛄;
            }"
          `);
        });
      });

      describe('path locations', () => {
        test('top-level', () => {
          let template = '{{@input}}';

          expect(templateBody(template)).toMatchInlineSnapshot(
            '"χ.emitContent(χ.resolveOrReturn(𝚪.args.input)());"'
          );
        });

        test('passed to an attribute', () => {
          let template = '<div data-attr={{@input}}></div>';

          expect(templateBody(template)).toMatchInlineSnapshot(`
            "{
              const 𝛄 = χ.emitElement(\\"div\\");
              χ.applyAttributes(𝛄.element, {
                \\"data-attr\\": χ.resolveOrReturn(𝚪.args.input)(),
              });
            }"
          `);
        });

        test('in a concat statement', () => {
          let template = '<div data-attr="hello, {{@input}}"></div>';

          expect(templateBody(template)).toMatchInlineSnapshot(`
            "{
              const 𝛄 = χ.emitElement(\\"div\\");
              χ.applyAttributes(𝛄.element, {
                \\"data-attr\\": \`\${χ.resolveOrReturn(𝚪.args.input)()}\`,
              });
            }"
          `);
        });

        describe('passed to an @arg', () => {
          test('an @arg', () => {
            let template = '<Greet @message={{@arg}} />';

            expect(templateBody(template, { globals: [] })).toMatchInlineSnapshot(`
              "{
                const 𝛄 = χ.emitComponent(χ.resolve(Greet)({ message: 𝚪.args.arg, ...χ.NamedArgsMarker }));
                𝛄;
              }"
            `);
          });

          test('a global identifier', () => {
            let template = '<Greet @message={{foo}} />';

            expect(templateBody(template, { globals: ['foo'] })).toMatchInlineSnapshot(`
              "{
                const 𝛄 = χ.emitComponent(χ.resolve(Greet)({ message: χ.resolveOrReturn(χ.Globals[\\"foo\\"])(), ...χ.NamedArgsMarker }));
                𝛄;
              }"
            `);
          });

          test('an in-scope identifier', () => {
            let template = '<Greet @message={{foo}} />';

            expect(templateBody(template, { globals: [] })).toMatchInlineSnapshot(`
              "{
                const 𝛄 = χ.emitComponent(χ.resolve(Greet)({ message: foo, ...χ.NamedArgsMarker }));
                𝛄;
              }"
            `);
          });

          test('a shadowed global identifier', () => {
            let template = '{{#let foo as |bar|}}<Greet @message={{bar}} />{{/let}}';

            expect(templateBody(template, { globals: ['let', 'foo'] })).toMatchInlineSnapshot(`
              "{
                const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"let\\"])(χ.Globals[\\"foo\\"]));
                {
                  const [bar] = 𝛄.blockParams[\\"default\\"];
                  {
                    const 𝛄 = χ.emitComponent(χ.resolve(Greet)({ message: bar, ...χ.NamedArgsMarker }));
                    𝛄;
                  }
                }
                χ.Globals[\\"let\\"];
              }"
            `);
          });
        });

        test('as a subexpression', () => {
          let template = '{{(@foo)}}';

          expect(templateBody(template)).toMatchInlineSnapshot(
            '"χ.emitContent(χ.resolveOrReturn(χ.resolve(𝚪.args.foo)())());"'
          );
        });
      });
    });

    describe('literals', () => {
      test('{{true}}', () => {
        expect(templateBody('{{true}}')).toMatchInlineSnapshot(`"true;"`);
      });

      test('{{false}}', () => {
        expect(templateBody('{{false}}')).toMatchInlineSnapshot(`"false;"`);
      });

      test('{{null}}', () => {
        expect(templateBody('{{null}}')).toMatchInlineSnapshot(`"null;"`);
      });

      test('{{undefined}}', () => {
        expect(templateBody('{{undefined}}')).toMatchInlineSnapshot(`"undefined;"`);
      });

      test('numbers', () => {
        expect(templateBody('{{123}}')).toMatchInlineSnapshot(`"123;"`);
      });

      test('strings', () => {
        expect(templateBody('{{"hello"}}')).toMatchInlineSnapshot(`"\\"hello\\";"`);
      });
    });

    describe('helper and inline-curly component invocations', () => {
      test('positional params', () => {
        let template = '{{doSomething "hello" 123}}';

        expect(templateBody(template, { globals: [] })).toMatchInlineSnapshot(
          '"χ.emitContent(χ.resolve(doSomething)(\\"hello\\", 123));"'
        );
      });

      test('named params', () => {
        let template = '{{doSomething a=123 b="ok"}}';

        expect(templateBody(template, { globals: [] })).toMatchInlineSnapshot(
          '"χ.emitContent(χ.resolve(doSomething)({ a: 123, b: \\"ok\\" , ...χ.NamedArgsMarker }));"'
        );
      });

      test('named and positional params', () => {
        let template = '{{doSomething "one" true 3 four=4}}';

        expect(templateBody(template, { globals: [] })).toMatchInlineSnapshot(
          '"χ.emitContent(χ.resolve(doSomething)(\\"one\\", true, 3, { four: 4 , ...χ.NamedArgsMarker }));"'
        );
      });
    });
  });

  describe('modifiers', () => {
    test('on a plain element', () => {
      let template = `<div {{modifier foo="bar"}}></div>`;

      expect(templateBody(template, { globals: [] })).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitElement(\\"div\\");
          χ.applyModifier(χ.resolve(modifier)(𝛄.element, { foo: \\"bar\\" , ...χ.NamedArgsMarker }));
        }"
      `);
    });

    test('on a component', () => {
      let template = `<MyComponent {{modifier foo="bar"}}/>`;

      expect(templateBody(template, { globals: [] })).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitComponent(χ.resolve(MyComponent)());
          χ.applyModifier(χ.resolve(modifier)(𝛄.element, { foo: \\"bar\\" , ...χ.NamedArgsMarker }));
        }"
      `);
    });
  });

  describe('subexpressions', () => {
    test('resolution', () => {
      let template = `<div data-attr={{concat (foo 1) (foo true)}}></div>`;

      expect(templateBody(template, { globals: [] })).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitElement(\\"div\\");
          χ.applyAttributes(𝛄.element, {
            \\"data-attr\\": χ.resolve(concat)(χ.resolve(foo)(1), χ.resolve(foo)(true)),
          });
        }"
      `);
    });
  });

  describe('block curlies', () => {
    test('invocation with a default block', () => {
      let template = stripIndent`
        {{#foo as |bar baz|}}
          {{bar}}: {{baz}}
        {{/foo}}
      `;

      expect(templateBody(template)).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"foo\\"])());
          {
            const [bar, baz] = 𝛄.blockParams[\\"default\\"];
            χ.emitContent(χ.resolveOrReturn(bar)());
            χ.emitContent(χ.resolveOrReturn(baz)());
          }
          χ.Globals[\\"foo\\"];
        }"
      `);
    });

    test('invocation with an else block', () => {
      let template = stripIndent`
        {{#foo as |bar baz|}}
          {{bar}}: {{baz}}
        {{else}}
          {{@oh}}
        {{/foo}}
      `;

      expect(templateBody(template)).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"foo\\"])());
          {
            const [bar, baz] = 𝛄.blockParams[\\"default\\"];
            χ.emitContent(χ.resolveOrReturn(bar)());
            χ.emitContent(χ.resolveOrReturn(baz)());
          }
          {
            const [] = 𝛄.blockParams[\\"else\\"];
            χ.emitContent(χ.resolveOrReturn(𝚪.args.oh)());
          }
          χ.Globals[\\"foo\\"];
        }"
      `);
    });

    test('chained else', () => {
      let template = stripIndent`
        {{#foo as |bar baz|}}
          {{bar}}: {{baz}}
        {{else}}
          {{@oh}}
        {{/foo}}
      `;

      expect(templateBody(template)).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"foo\\"])());
          {
            const [bar, baz] = 𝛄.blockParams[\\"default\\"];
            χ.emitContent(χ.resolveOrReturn(bar)());
            χ.emitContent(χ.resolveOrReturn(baz)());
          }
          {
            const [] = 𝛄.blockParams[\\"else\\"];
            χ.emitContent(χ.resolveOrReturn(𝚪.args.oh)());
          }
          χ.Globals[\\"foo\\"];
        }"
      `);
    });
  });

  describe('plain elements', () => {
    test('with programmatic contents', () => {
      let template = '<div>{{@foo}}</div>';

      expect(templateBody(template)).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitElement(\\"div\\");
          𝛄;
          χ.emitContent(χ.resolveOrReturn(𝚪.args.foo)());
        }"
      `);
    });

    test('with mustache attrs', () => {
      let template = '<div data-foo={{@foo}}></div>';

      expect(templateBody(template)).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitElement(\\"div\\");
          χ.applyAttributes(𝛄.element, {
            \\"data-foo\\": χ.resolveOrReturn(𝚪.args.foo)(),
          });
        }"
      `);
    });

    test('with interpolated attrs', () => {
      let template = '<div data-foo="value-{{@foo}}-{{@bar}}"></div>';

      expect(templateBody(template)).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitElement(\\"div\\");
          χ.applyAttributes(𝛄.element, {
            \\"data-foo\\": \`\${χ.resolveOrReturn(𝚪.args.foo)()}\${χ.resolveOrReturn(𝚪.args.bar)()}\`,
          });
        }"
      `);
    });

    test('with splattributes', () => {
      let template = '<div ...attributes></div>';

      expect(templateBody(template)).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitElement(\\"div\\");
          χ.applySplattributes(𝚪.element, 𝛄.element);
        }"
      `);
    });
  });

  describe('angle bracket components', () => {
    test('self-closing', () => {
      let template = `<Foo @bar="hello" />`;

      expect(templateBody(template)).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"Foo\\"])({ bar: \\"hello\\", ...χ.NamedArgsMarker }));
          𝛄;
        }"
      `);
    });

    test('with a default block', () => {
      let template = stripIndent`
        <Foo as |bar|>
          {{bar}}
        </Foo>
      `;

      expect(templateBody(template)).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"Foo\\"])());
          𝛄;
          {
            const [bar] = 𝛄.blockParams[\\"default\\"];
            χ.emitContent(χ.resolveOrReturn(bar)());
          }
          χ.Globals[\\"Foo\\"];
        }"
      `);
    });

    test('with splattributes', () => {
      let template = '<Foo ...attributes />';

      expect(templateBody(template, { globals: [] })).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitComponent(χ.resolve(Foo)());
          χ.applySplattributes(𝚪.element, 𝛄.element);
        }"
      `);
    });

    test('with an in-scope variable for a name', () => {
      let template = '{{#let "div" as |div|}}<div></div>{{/let}}';

      expect(templateBody(template, { globals: ['let'] })).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"let\\"])(\\"div\\"));
          {
            const [div] = 𝛄.blockParams[\\"default\\"];
            {
              const 𝛄 = χ.emitComponent(χ.resolve(div)());
              𝛄;
              {
                const [] = 𝛄.blockParams[\\"default\\"];
              }
              div;
            }
          }
          χ.Globals[\\"let\\"];
        }"
      `);
    });

    test('with a path for a name', () => {
      let template = '<foo.bar @arg="hello" />';

      expect(templateBody(template, { globals: [] })).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitComponent(χ.resolve(foo?.bar)({ arg: \\"hello\\", ...χ.NamedArgsMarker }));
          𝛄;
        }"
      `);
    });

    test('with an @arg for a name', () => {
      let template = '<@foo @arg="hello" />';

      expect(templateBody(template)).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitComponent(χ.resolve(𝚪.args.foo)({ arg: \\"hello\\", ...χ.NamedArgsMarker }));
          𝛄;
        }"
      `);
    });

    test('with a `this` path for a name', () => {
      let template = '<this.foo @arg="hello" />';

      expect(templateBody(template)).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitComponent(χ.resolve(𝚪.this.foo)({ arg: \\"hello\\", ...χ.NamedArgsMarker }));
          𝛄;
        }"
      `);
    });

    test('with named blocks', () => {
      let template = stripIndent`
        <Foo>
          <:head as |h|>
            {{h}}
          </:head>

          <:body as |b|>
            <b.contents>Hello!</b.contents>
          </:body>
        </Foo>
      `;

      expect(templateBody(template)).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"Foo\\"])());
          𝛄;
          {
            const [h] = 𝛄.blockParams[\\"head\\"];
            χ.emitContent(χ.resolveOrReturn(h)());
          }
          {
            const [b] = 𝛄.blockParams[\\"body\\"];
            {
              const 𝛄 = χ.emitComponent(χ.resolve(b?.contents)());
              𝛄;
              {
                const [] = 𝛄.blockParams[\\"default\\"];
              }
              b?.contents;
            }
          }
          χ.Globals[\\"Foo\\"];
        }"
      `);
    });

    test('with concat args', () => {
      let template = `<Foo @arg="bar-{{baz}}" />`;

      expect(templateBody(template, { globals: [] })).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitComponent(χ.resolve(Foo)({ arg: \`\${χ.resolveOrReturn(baz)()}\`, ...χ.NamedArgsMarker }));
          𝛄;
        }"
      `);
    });

    test('with yielded component', () => {
      let template = stripIndent`
        <Foo as |NS|>
          <NS.Nested.Custom class="foo" />
        </Foo>
      `;

      expect(templateBody(template)).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"Foo\\"])());
          𝛄;
          {
            const [NS] = 𝛄.blockParams[\\"default\\"];
            {
              const 𝛄 = χ.emitComponent(χ.resolve(NS?.Nested?.Custom)());
              χ.applyAttributes(𝛄.element, {
                class: \\"foo\\",
              });
            }
          }
          χ.Globals[\\"Foo\\"];
        }"
      `);
    });

    test('with a reserved block param identifier', () => {
      let template = stripIndent`
        <Foo as |switch|>
          {{switch}}
        </Foo>
      `;

      expect(templateBody(template)).toMatchInlineSnapshot(`
        "{
          const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"Foo\\"])());
          𝛄;
          {
            const [__switch] = 𝛄.blockParams[\\"default\\"];
            χ.emitContent(χ.resolveOrReturn(__switch)());
          }
          χ.Globals[\\"Foo\\"];
        }"
      `);
    });
  });

  describe('error conditions', () => {
    test('Handlebars syntax error', () => {
      let { errors } = templateToTypescript('<Foo @attr={{"123}} />', {
        typesModule: '@norith/glint-template',
      });

      expect(errors).toEqual([
        {
          location: { start: 11, end: 13 },
          message: stripIndent`
            Parse error on line 1:
            <Foo @attr={{\"123}} />
            -------------^
            Expecting 'OPEN_SEXPR', 'ID', 'STRING', 'NUMBER', 'BOOLEAN', 'UNDEFINED', 'NULL', 'DATA', got 'INVALID'
          `,
        },
      ]);
    });

    test('HTML syntax error', () => {
      let { errors } = templateToTypescript('<Foo </Foo>', {
        typesModule: '@norith/glint-template',
      });

      expect(errors).toEqual([
        {
          location: { start: 5, end: 5 },
          message:
            "< is not a valid character within attribute names: (error occurred in 'an unknown module' @ line 1 : column 5)",
        },
      ]);
    });

    test('{{yield}} in expression position', () => {
      let { errors } = templateToTypescript('<Foo @attr={{testYield}} />', {
        typesModule: '@norith/glint-template',
        specialForms: { testYield: 'yield' },
      });

      expect(errors).toEqual([
        {
          message: '{{testYield}} may only appear as a top-level statement',
          location: { start: 11, end: 24 },
        },
      ]);
    });

    test('{{yield}} to a dynamic named block', () => {
      let { errors } = templateToTypescript('{{testYield to=@blockName}}', {
        typesModule: '@norith/glint-template',
        specialForms: { testYield: 'yield' },
      });

      expect(errors).toEqual([
        {
          message: 'Named block {{testYield}}s must have a literal block name',
          location: { start: 0, end: 27 },
        },
      ]);
    });

    test('{{hash}} with positional parameters', () => {
      let { errors } = templateToTypescript('<Foo @attr={{testHash 123 foo="bar"}} />', {
        typesModule: '@norith/glint-template',
        specialForms: { testHash: 'object-literal' },
      });

      expect(errors).toEqual([
        {
          message: '{{testHash}} only accepts named parameters',
          location: { start: 11, end: 37 },
        },
      ]);
    });

    test('{{array}} with named parameters', () => {
      let { errors } = templateToTypescript('<Foo @attr={{testArray 123 foo="bar"}} />', {
        typesModule: '@norith/glint-template',
        specialForms: { testArray: 'array-literal' },
      });

      expect(errors).toEqual([
        {
          message: '{{testArray}} only accepts positional parameters',
          location: { start: 11, end: 38 },
        },
      ]);
    });

    test('{{eq}} with named parameters', () => {
      let { errors } = templateToTypescript('<Foo @attr={{testEq 123 foo="bar"}} />', {
        typesModule: '@norith/glint-template',
        specialForms: { testEq: '===' },
      });

      expect(errors).toEqual([
        {
          message: '{{testEq}} only accepts positional parameters',
          location: { start: 11, end: 35 },
        },
      ]);
    });

    test('{{eq}} with wrong number of parameters', () => {
      let { errors } = templateToTypescript('<Foo @attr={{testEq 123 456 789}} />', {
        typesModule: '@norith/glint-template',
        specialForms: { testEq: '===' },
      });

      expect(errors).toEqual([
        {
          message: '{{testEq}} requires exactly two parameters',
          location: { start: 11, end: 33 },
        },
      ]);
    });

    test('{{neq}} with named parameters', () => {
      let { errors } = templateToTypescript('<Foo @attr={{testNeq 123 foo="bar"}} />', {
        typesModule: '@norith/glint-template',
        specialForms: { testNeq: '!==' },
      });

      expect(errors).toEqual([
        {
          message: '{{testNeq}} only accepts positional parameters',
          location: { start: 11, end: 36 },
        },
      ]);
    });

    test('{{neq}} with wrong number of parameters', () => {
      let { errors } = templateToTypescript('<Foo @attr={{testNeq 123 456 789}} />', {
        typesModule: '@norith/glint-template',
        specialForms: { testNeq: '!==' },
      });

      expect(errors).toEqual([
        {
          message: '{{testNeq}} requires exactly two parameters',
          location: { start: 11, end: 34 },
        },
      ]);
    });

    test('{{and}} with named parameters', () => {
      let { errors } = templateToTypescript('<Foo @attr={{testAnd 123 456 foo="bar"}} />', {
        typesModule: '@norith/glint-template',
        specialForms: { testAnd: '&&' },
      });

      expect(errors).toEqual([
        {
          message: '{{testAnd}} only accepts positional parameters',
          location: { start: 11, end: 40 },
        },
      ]);
    });

    test('{{and}} with wrong number of parameters', () => {
      let { errors } = templateToTypescript('<Foo @attr={{testAnd 123}} />', {
        typesModule: '@norith/glint-template',
        specialForms: { testAnd: '&&' },
      });

      expect(errors).toEqual([
        {
          message: '{{testAnd}} requires at least two parameters',
          location: { start: 11, end: 26 },
        },
      ]);
    });

    test('{{or}} with named parameters', () => {
      let { errors } = templateToTypescript('<Foo @attr={{testOr 123 456 foo="bar"}} />', {
        typesModule: '@norith/glint-template',
        specialForms: { testOr: '||' },
      });

      expect(errors).toEqual([
        {
          message: '{{testOr}} only accepts positional parameters',
          location: { start: 11, end: 39 },
        },
      ]);
    });

    test('{{or}} with wrong number of parameters', () => {
      let { errors } = templateToTypescript('<Foo @attr={{testOr 123}} />', {
        typesModule: '@norith/glint-template',
        specialForms: { testOr: '||' },
      });

      expect(errors).toEqual([
        {
          message: '{{testOr}} requires at least two parameters',
          location: { start: 11, end: 25 },
        },
      ]);
    });

    test('{{not}} with named parameters', () => {
      let { errors } = templateToTypescript('<Foo @attr={{testNot 123 foo="bar"}} />', {
        typesModule: '@norith/glint-template',
        specialForms: { testNot: '!' },
      });

      expect(errors).toEqual([
        {
          message: '{{testNot}} only accepts positional parameters',
          location: { start: 11, end: 36 },
        },
      ]);
    });

    test('{{not}} with wrong number of parameters', () => {
      let { errors } = templateToTypescript('<Foo @attr={{testNot 123 456}} />', {
        typesModule: '@norith/glint-template',
        specialForms: { testNot: '!' },
      });

      expect(errors).toEqual([
        {
          message: '{{testNot}} requires exactly one parameter',
          location: { start: 11, end: 30 },
        },
      ]);
    });

    test('inline {{if}} with no consequent', () => {
      let { errors } = templateToTypescript('<Foo @attr={{testIf true}} />', {
        typesModule: '@norith/glint-template',
        specialForms: { testIf: 'if' },
      });

      expect(errors).toEqual([
        {
          message: '{{testIf}} requires at least two parameters',
          location: { start: 11, end: 26 },
        },
      ]);
    });

    test('block {{#if}} with no condition', () => {
      let { errors } = templateToTypescript(
        stripIndent`
          {{#testIf}}
            hello!
          {{/testIf}}
        `,
        { typesModule: '@norith/glint-template', specialForms: { testIf: 'if' } }
      );

      expect(errors).toEqual([
        {
          message: '{{#testIf}} requires exactly one condition',
          location: { start: 0, end: 32 },
        },
      ]);
    });

    test('named blocks mixed with other content', () => {
      let { errors } = templateToTypescript(
        stripIndent`
          Header content
          <Component>
            hello
            <:block></:block>

            goodbye

            <:other></:other>
          </Component>
          Footer content
        `,
        { typesModule: '@norith/glint-template' }
      );

      expect(errors).toEqual([
        {
          message: 'Named blocks may not be mixed with other content',
          location: { start: 29, end: 34 },
        },
        {
          message: 'Named blocks may not be mixed with other content',
          location: { start: 58, end: 65 },
        },
      ]);
    });

    test('invalid block param name', () => {
      // This is valid HBS, but complex for us to support. Since it's only a
      // local identifier, the author has full discretion over how to name it.
      let { errors } = templateToTypescript(
        stripIndent`
          <Component as |foo-bar|>
            {{foo-bar}}
          </Component>
        `,
        { typesModule: '@norith/glint-template' }
      );

      expect(errors).toEqual([
        {
          message: 'Block params must be valid TypeScript identifiers',
          location: { start: 0, end: 51 },
        },
      ]);
    });
  });
});
