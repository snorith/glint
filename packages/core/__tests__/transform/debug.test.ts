import ts from 'typescript';
import { describe, test, expect } from 'vitest';
import { rewriteModule } from '../../src/transform/index.js';
import { stripIndent } from 'common-tags';
import { GlintEnvironment } from '../../src/config/index.js';

describe('Transform: Debug utilities', () => {
  describe('TransformedModule#toDebugString', () => {
    test('companion template', () => {
      let script = {
        filename: 'test.ts',
        contents: stripIndent`
          import Component from '@ember/component';

          export default class MyComponent extends Component {
            private message = 'hi';
          }
        `,
      };

      let template = {
        filename: 'test.hbs',
        contents: stripIndent`
          {{#each (array "world" "planet" "universe") as |target index|}}
            #{{add index 1}}: {{this.message}}, {{target}}!
          {{/each}}
        `,
      };

      let transformedModule = rewriteModule(
        ts,
        { script, template },
        GlintEnvironment.load('ember-loose')
      );

      expect(transformedModule?.toDebugString()).toMatchInlineSnapshot(`
        "TransformedModule

        | Mapping: TemplateEmbedding
        |  hbs(0:123):   {{#each (array \\"world\\" \\"planet\\" \\"universe\\") as |target index|}}\\\\n  #{{add index 1}}: {{this.message}}, {{target}}!\\\\n{{/each}}
        |  ts(131:685):  ({} as typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")) {\\\\n  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"each\\"])([\\"world\\", \\"planet\\", \\"universe\\"]));\\\\n    {\\\\n      const [target, index] = 𝛄.blockParams[\\"default\\"];\\\\n      χ.emitContent(χ.resolve(χ.Globals[\\"add\\"])(index, 1));\\\\n      χ.emitContent(χ.resolveOrReturn(𝚪.this.message)());\\\\n      χ.emitContent(χ.resolveOrReturn(target)());\\\\n    }\\\\n    χ.Globals[\\"each\\"];\\\\n  }\\\\n  𝚪; χ;\\\\n})
        |
        | | Mapping: Template
        | |  hbs(0:123):   {{#each (array \\"world\\" \\"planet\\" \\"universe\\") as |target index|}}\\\\n  #{{add index 1}}: {{this.message}}, {{target}}!\\\\n{{/each}}
        | |  ts(310:674):  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"each\\"])([\\"world\\", \\"planet\\", \\"universe\\"]));\\\\n    {\\\\n      const [target, index] = 𝛄.blockParams[\\"default\\"];\\\\n      χ.emitContent(χ.resolve(χ.Globals[\\"add\\"])(index, 1));\\\\n      χ.emitContent(χ.resolveOrReturn(𝚪.this.message)());\\\\n      χ.emitContent(χ.resolveOrReturn(target)());\\\\n    }\\\\n    χ.Globals[\\"each\\"];\\\\n  }
        | |
        | | | Mapping: BlockStatement
        | | |  hbs(0:123):   {{#each (array \\"world\\" \\"planet\\" \\"universe\\") as |target index|}}\\\\n  #{{add index 1}}: {{this.message}}, {{target}}!\\\\n{{/each}}
        | | |  ts(310:673):  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"each\\"])([\\"world\\", \\"planet\\", \\"universe\\"]));\\\\n    {\\\\n      const [target, index] = 𝛄.blockParams[\\"default\\"];\\\\n      χ.emitContent(χ.resolve(χ.Globals[\\"add\\"])(index, 1));\\\\n      χ.emitContent(χ.resolveOrReturn(𝚪.this.message)());\\\\n      χ.emitContent(χ.resolveOrReturn(target)());\\\\n    }\\\\n    χ.Globals[\\"each\\"];\\\\n  }
        | | |
        | | | | Mapping: PathExpression
        | | | |  hbs(3:7):     each
        | | | |  ts(355:372):  χ.Globals[\\"each\\"]
        | | | |
        | | | | | Mapping: Identifier
        | | | | |  hbs(3:7):     each
        | | | | |  ts(366:370):  each
        | | | | |
        | | | |
        | | | | Mapping: SubExpression
        | | | |  hbs(8:43):    (array \\"world\\" \\"planet\\" \\"universe\\")
        | | | |  ts(374:405):  [\\"world\\", \\"planet\\", \\"universe\\"]
        | | | |
        | | | | | Mapping: StringLiteral
        | | | | |  hbs(15:22):   \\"world\\"
        | | | | |  ts(375:382):  \\"world\\"
        | | | | |
        | | | | | Mapping: StringLiteral
        | | | | |  hbs(23:31):   \\"planet\\"
        | | | | |  ts(384:392):  \\"planet\\"
        | | | | |
        | | | | | Mapping: StringLiteral
        | | | | |  hbs(32:42):   \\"universe\\"
        | | | | |  ts(394:404):  \\"universe\\"
        | | | | |
        | | | |
        | | | | Mapping: Identifier
        | | | |  hbs(48:54):   target
        | | | |  ts(428:434):  target
        | | | |
        | | | | Mapping: Identifier
        | | | |  hbs(55:60):   index
        | | | |  ts(436:441):  index
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(66:67):   #
        | | | |  ts(472:472):
        | | | |
        | | | | Mapping: MustacheStatement
        | | | |  hbs(67:82):   {{add index 1}}
        | | | |  ts(472:530):  χ.emitContent(χ.resolve(χ.Globals[\\"add\\"])(index, 1))
        | | | |
        | | | | | Mapping: PathExpression
        | | | | |  hbs(69:72):   add
        | | | | |  ts(502:518):  χ.Globals[\\"add\\"]
        | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(69:72):   add
        | | | | | |  ts(513:516):  add
        | | | | | |
        | | | | |
        | | | | | Mapping: PathExpression
        | | | | |  hbs(73:78):   index
        | | | | |  ts(520:525):  index
        | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(73:78):   index
        | | | | | |  ts(520:525):  index
        | | | | | |
        | | | | |
        | | | | | Mapping: NumberLiteral
        | | | | |  hbs(79:80):   1
        | | | | |  ts(527:528):  1
        | | | | |
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(82:83):   :
        | | | |  ts(532:532):
        | | | |
        | | | | Mapping: MustacheStatement
        | | | |  hbs(84:100):  {{this.message}}
        | | | |  ts(532:589):  χ.emitContent(χ.resolveOrReturn(𝚪.this.message)())
        | | | |
        | | | | | Mapping: PathExpression
        | | | | |  hbs(86:98):   this.message
        | | | | |  ts(570:585):  𝚪.this.message
        | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(86:90):   this
        | | | | | |  ts(573:577):  this
        | | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(91:98):   message
        | | | | | |  ts(578:585):  message
        | | | | | |
        | | | | |
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(100:101): ,
        | | | |  ts(591:591):
        | | | |
        | | | | Mapping: MustacheStatement
        | | | |  hbs(102:112): {{target}}
        | | | |  ts(591:639):  χ.emitContent(χ.resolveOrReturn(target)())
        | | | |
        | | | | | Mapping: PathExpression
        | | | | |  hbs(104:110): target
        | | | | |  ts(629:635):  target
        | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(104:110): target
        | | | | | |  ts(629:635):  target
        | | | | | |
        | | | | |
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(112:113): !
        | | | |  ts(641:641):
        | | | |
        | | | | Mapping: Identifier
        | | | |  hbs(117:121): each
        | | | |  ts(662:666):  each
        | | | |
        | | |
        | |
        |"
      `);
    });

    test('inline template', () => {
      let script = {
        filename: 'test.ts',
        contents: stripIndent`
          import Component, { hbs } from '@glimmerx/component';

          export default class MyComponent extends Component {
            private bar = 'hi';

            static template = hbs\`
              <HelperComponent @foo={{this.bar}} />
            \`;
          }

          class HelperComponent extends Component<{ Args: { foo: string } }> {
            static template = hbs\`
              <p ...attributes>
                Hello, {{@foo}}!

                {{! @glint-expect-error: no @bar arg }}
                {{@bar}}
              </p>
            \`;
          }
        `,
      };

      let transformedModule = rewriteModule(ts, { script }, GlintEnvironment.load('glimmerx'));

      expect(transformedModule?.toDebugString()).toMatchInlineSnapshot(`
        "TransformedModule

        | Mapping: TemplateEmbedding
        |  hbs(151:201): hbs\`\\\\n    <HelperComponent @foo={{this.bar}} />\\\\n  \`
        |  ts(151:462):  ({} as typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")) {\\\\n  hbs;\\\\n  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(HelperComponent)({ foo: 𝚪.this.bar, ...χ.NamedArgsMarker }));\\\\n    𝛄;\\\\n  }\\\\n  𝚪; χ;\\\\n})
        |
        | | Mapping: Template
        | |  hbs(155:200): <HelperComponent @foo={{this.bar}} />
        | |  ts(331:451):  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(HelperComponent)({ foo: 𝚪.this.bar, ...χ.NamedArgsMarker }));\\\\n    𝛄;\\\\n  }
        | |
        | | | Mapping: TextContent
        | | |  hbs(155:160):
        | | |  ts(331:331):
        | | |
        | | | Mapping: ElementNode
        | | |  hbs(160:197): <HelperComponent @foo={{this.bar}} />
        | | |  ts(331:451):  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(HelperComponent)({ foo: 𝚪.this.bar, ...χ.NamedArgsMarker }));\\\\n    𝛄;\\\\n  }
        | | |
        | | | | Mapping: Identifier
        | | | |  hbs(161:176): HelperComponent
        | | | |  ts(376:391):  HelperComponent
        | | | |
        | | | | Mapping: AttrNode
        | | | |  hbs(177:194): @foo={{this.bar}}
        | | | |  ts(395:411):  foo: 𝚪.this.bar
        | | | |
        | | | | | Mapping: Identifier
        | | | | |  hbs(178:181): foo
        | | | | |  ts(395:398):  foo
        | | | | |
        | | | | | Mapping: MustacheStatement
        | | | | |  hbs(182:194): {{this.bar}}
        | | | | |  ts(400:411):  𝚪.this.bar
        | | | | |
        | | | | | | Mapping: PathExpression
        | | | | | |  hbs(184:192): this.bar
        | | | | | |  ts(400:411):  𝚪.this.bar
        | | | | | |
        | | | | | | | Mapping: Identifier
        | | | | | | |  hbs(184:188): this
        | | | | | | |  ts(403:407):  this
        | | | | | | |
        | | | | | | | Mapping: Identifier
        | | | | | | |  hbs(189:192): bar
        | | | | | | |  ts(408:411):  bar
        | | | | | | |
        | | | | | |
        | | | | |
        | | | |
        | | |
        | | | Mapping: TextContent
        | | |  hbs(197:200):
        | | |  ts(451:451):
        | | |
        | |
        |

        | Mapping: TemplateEmbedding
        |  hbs(295:419): hbs\`\\\\n    <p ...attributes>\\\\n      Hello, {{@foo}}!\\\\n\\\\n      {{! @glint-expect-error: no @bar arg }}\\\\n      {{@bar}}\\\\n    </p>\\\\n  \`
        |  ts(556:973):  ({} as typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")) {\\\\n  hbs;\\\\n  {\\\\n    const 𝛄 = χ.emitElement(\\"p\\");\\\\n    χ.applySplattributes(𝚪.element, 𝛄.element);\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.foo)());\\\\n    // @glint-expect-error\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.bar)());\\\\n  }\\\\n  𝚪; χ;\\\\n})
        |
        | | Mapping: Template
        | |  hbs(299:418): <p ...attributes>\\\\n      Hello, {{@foo}}!\\\\n\\\\n      {{! @glint-expect-error: no @bar arg }}\\\\n      {{@bar}}\\\\n    </p>
        | |  ts(736:962):  {\\\\n    const 𝛄 = χ.emitElement(\\"p\\");\\\\n    χ.applySplattributes(𝚪.element, 𝛄.element);\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.foo)());\\\\n    // @glint-expect-error\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.bar)());\\\\n  }
        | |
        | | | Mapping: TextContent
        | | |  hbs(299:304):
        | | |  ts(736:736):
        | | |
        | | | Mapping: ElementNode
        | | |  hbs(304:415): <p ...attributes>\\\\n      Hello, {{@foo}}!\\\\n\\\\n      {{! @glint-expect-error: no @bar arg }}\\\\n      {{@bar}}\\\\n    </p>
        | | |  ts(736:962):  {\\\\n    const 𝛄 = χ.emitElement(\\"p\\");\\\\n    χ.applySplattributes(𝚪.element, 𝛄.element);\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.foo)());\\\\n    // @glint-expect-error\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.bar)());\\\\n  }
        | | |
        | | | | Mapping: AttrNode
        | | | |  hbs(307:320): ...attributes
        | | | |  ts(775:824):  χ.applySplattributes(𝚪.element, 𝛄.element);
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(328:334): Hello,
        | | | |  ts(825:825):
        | | | |
        | | | | Mapping: MustacheStatement
        | | | |  hbs(335:343): {{@foo}}
        | | | |  ts(825:876):  χ.emitContent(χ.resolveOrReturn(𝚪.args.foo)())
        | | | |
        | | | | | Mapping: PathExpression
        | | | | |  hbs(337:341): @foo
        | | | | |  ts(861:872):  𝚪.args.foo
        | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(338:341): foo
        | | | | | |  ts(869:872):  foo
        | | | | | |
        | | | | |
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(343:344): !
        | | | |  ts(878:878):
        | | | |
        | | | | Mapping: MustacheCommentStatement
        | | | |  hbs(352:391): {{! @glint-expect-error: no @bar arg }}
        | | | |  ts(878:905):  // @glint-expect-error
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(392:398):
        | | | |  ts(905:905):
        | | | |
        | | | | Mapping: MustacheStatement
        | | | |  hbs(398:406): {{@bar}}
        | | | |  ts(905:956):  χ.emitContent(χ.resolveOrReturn(𝚪.args.bar)())
        | | | |
        | | | | | Mapping: PathExpression
        | | | | |  hbs(400:404): @bar
        | | | | |  ts(941:952):  𝚪.args.bar
        | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(401:404): bar
        | | | | | |  ts(949:952):  bar
        | | | | | |
        | | | | |
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(406:411):
        | | | |  ts(958:958):
        | | | |
        | | |
        | | | Mapping: TextContent
        | | |  hbs(415:418):
        | | |  ts(962:962):
        | | |
        | |
        |"
      `);
    });

    test('Windows line endings', () => {
      let script = {
        filename: 'test.ts',
        contents: stripIndent`
          import Component, { hbs } from '@glimmerx/component';

          export default class MyComponent extends Component {
            private bar = 'hi';

            static template = hbs\`
              <HelperComponent @foo={{this.bar}} />
            \`;
          }

          class HelperComponent extends Component<{ Args: { foo: string } }> {
            static template = hbs\`
              <p ...attributes>
                Hello, {{@foo}}!

                {{! @glint-expect-error: no @bar arg }}
                {{@bar}}
              </p>
            \`;
          }
        `.replace(/\n/g, '\r\n'),
      };

      let transformedModule = rewriteModule(ts, { script }, GlintEnvironment.load('glimmerx'));

      expect(transformedModule?.toDebugString()).toMatchInlineSnapshot(`
        "TransformedModule

        | Mapping: TemplateEmbedding
        |  hbs(156:208): hbs\`\\\\r\\\\n    <HelperComponent @foo={{this.bar}} />\\\\r\\\\n  \`
        |  ts(156:467):  ({} as typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")) {\\\\n  hbs;\\\\n  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(HelperComponent)({ foo: 𝚪.this.bar, ...χ.NamedArgsMarker }));\\\\n    𝛄;\\\\n  }\\\\n  𝚪; χ;\\\\n})
        |
        | | Mapping: Template
        | |  hbs(160:207): <HelperComponent @foo={{this.bar}} />
        | |  ts(336:456):  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(HelperComponent)({ foo: 𝚪.this.bar, ...χ.NamedArgsMarker }));\\\\n    𝛄;\\\\n  }
        | |
        | | | Mapping: TextContent
        | | |  hbs(160:166):
        | | |  ts(336:336):
        | | |
        | | | Mapping: ElementNode
        | | |  hbs(166:203): <HelperComponent @foo={{this.bar}} />
        | | |  ts(336:456):  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(HelperComponent)({ foo: 𝚪.this.bar, ...χ.NamedArgsMarker }));\\\\n    𝛄;\\\\n  }
        | | |
        | | | | Mapping: Identifier
        | | | |  hbs(167:182): HelperComponent
        | | | |  ts(381:396):  HelperComponent
        | | | |
        | | | | Mapping: AttrNode
        | | | |  hbs(183:200): @foo={{this.bar}}
        | | | |  ts(400:416):  foo: 𝚪.this.bar
        | | | |
        | | | | | Mapping: Identifier
        | | | | |  hbs(184:187): foo
        | | | | |  ts(400:403):  foo
        | | | | |
        | | | | | Mapping: MustacheStatement
        | | | | |  hbs(188:200): {{this.bar}}
        | | | | |  ts(405:416):  𝚪.this.bar
        | | | | |
        | | | | | | Mapping: PathExpression
        | | | | | |  hbs(190:198): this.bar
        | | | | | |  ts(405:416):  𝚪.this.bar
        | | | | | |
        | | | | | | | Mapping: Identifier
        | | | | | | |  hbs(190:194): this
        | | | | | | |  ts(408:412):  this
        | | | | | | |
        | | | | | | | Mapping: Identifier
        | | | | | | |  hbs(195:198): bar
        | | | | | | |  ts(413:416):  bar
        | | | | | | |
        | | | | | |
        | | | | |
        | | | |
        | | |
        | | | Mapping: TextContent
        | | |  hbs(203:207):
        | | |  ts(456:456):
        | | |
        | |
        |

        | Mapping: TemplateEmbedding
        |  hbs(306:437): hbs\`\\\\r\\\\n    <p ...attributes>\\\\r\\\\n      Hello, {{@foo}}!\\\\r\\\\n\\\\r\\\\n      {{! @glint-expect-error: no @bar arg }}\\\\r\\\\n      {{@bar}}\\\\r\\\\n    </p>\\\\r\\\\n  \`
        |  ts(565:982):  ({} as typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")) {\\\\n  hbs;\\\\n  {\\\\n    const 𝛄 = χ.emitElement(\\"p\\");\\\\n    χ.applySplattributes(𝚪.element, 𝛄.element);\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.foo)());\\\\n    // @glint-expect-error\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.bar)());\\\\n  }\\\\n  𝚪; χ;\\\\n})
        |
        | | Mapping: Template
        | |  hbs(310:436): <p ...attributes>\\\\r\\\\n      Hello, {{@foo}}!\\\\r\\\\n\\\\r\\\\n      {{! @glint-expect-error: no @bar arg }}\\\\r\\\\n      {{@bar}}\\\\r\\\\n    </p>
        | |  ts(745:971):  {\\\\n    const 𝛄 = χ.emitElement(\\"p\\");\\\\n    χ.applySplattributes(𝚪.element, 𝛄.element);\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.foo)());\\\\n    // @glint-expect-error\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.bar)());\\\\n  }
        | |
        | | | Mapping: TextContent
        | | |  hbs(310:316):
        | | |  ts(745:745):
        | | |
        | | | Mapping: ElementNode
        | | |  hbs(316:432): <p ...attributes>\\\\r\\\\n      Hello, {{@foo}}!\\\\r\\\\n\\\\r\\\\n      {{! @glint-expect-error: no @bar arg }}\\\\r\\\\n      {{@bar}}\\\\r\\\\n    </p>
        | | |  ts(745:971):  {\\\\n    const 𝛄 = χ.emitElement(\\"p\\");\\\\n    χ.applySplattributes(𝚪.element, 𝛄.element);\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.foo)());\\\\n    // @glint-expect-error\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.bar)());\\\\n  }
        | | |
        | | | | Mapping: AttrNode
        | | | |  hbs(319:332): ...attributes
        | | | |  ts(784:833):  χ.applySplattributes(𝚪.element, 𝛄.element);
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(340:347): Hello,
        | | | |  ts(834:834):
        | | | |
        | | | | Mapping: MustacheStatement
        | | | |  hbs(348:356): {{@foo}}
        | | | |  ts(834:885):  χ.emitContent(χ.resolveOrReturn(𝚪.args.foo)())
        | | | |
        | | | | | Mapping: PathExpression
        | | | | |  hbs(350:354): @foo
        | | | | |  ts(870:881):  𝚪.args.foo
        | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(351:354): foo
        | | | | | |  ts(878:881):  foo
        | | | | | |
        | | | | |
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(356:359): !
        | | | |  ts(887:887):
        | | | |
        | | | | Mapping: MustacheCommentStatement
        | | | |  hbs(367:406): {{! @glint-expect-error: no @bar arg }}
        | | | |  ts(887:914):  // @glint-expect-error
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(408:414):
        | | | |  ts(914:914):
        | | | |
        | | | | Mapping: MustacheStatement
        | | | |  hbs(414:422): {{@bar}}
        | | | |  ts(914:965):  χ.emitContent(χ.resolveOrReturn(𝚪.args.bar)())
        | | | |
        | | | | | Mapping: PathExpression
        | | | | |  hbs(416:420): @bar
        | | | | |  ts(950:961):  𝚪.args.bar
        | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(417:420): bar
        | | | | | |  ts(958:961):  bar
        | | | | | |
        | | | | |
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(422:428):
        | | | |  ts(967:967):
        | | | |
        | | |
        | | | Mapping: TextContent
        | | |  hbs(432:436):
        | | |  ts(971:971):
        | | |
        | |
        |"
      `);
    });
  });
});
