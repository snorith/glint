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
        |  ts(131:699):  ({} as typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-ember-loose/-private/dsl\\")) {\\\\n  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"each\\"])([\\"world\\", \\"planet\\", \\"universe\\"]));\\\\n    {\\\\n      const [target, index] = 𝛄.blockParams[\\"default\\"];\\\\n      χ.emitContent(χ.resolve(χ.Globals[\\"add\\"])(index, 1));\\\\n      χ.emitContent(χ.resolveOrReturn(𝚪.this.message)());\\\\n      χ.emitContent(χ.resolveOrReturn(target)());\\\\n    }\\\\n    χ.Globals[\\"each\\"];\\\\n  }\\\\n  𝚪; χ;\\\\n})
        |
        | | Mapping: Template
        | |  hbs(0:123):   {{#each (array \\"world\\" \\"planet\\" \\"universe\\") as |target index|}}\\\\n  #{{add index 1}}: {{this.message}}, {{target}}!\\\\n{{/each}}
        | |  ts(324:688):  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"each\\"])([\\"world\\", \\"planet\\", \\"universe\\"]));\\\\n    {\\\\n      const [target, index] = 𝛄.blockParams[\\"default\\"];\\\\n      χ.emitContent(χ.resolve(χ.Globals[\\"add\\"])(index, 1));\\\\n      χ.emitContent(χ.resolveOrReturn(𝚪.this.message)());\\\\n      χ.emitContent(χ.resolveOrReturn(target)());\\\\n    }\\\\n    χ.Globals[\\"each\\"];\\\\n  }
        | |
        | | | Mapping: BlockStatement
        | | |  hbs(0:123):   {{#each (array \\"world\\" \\"planet\\" \\"universe\\") as |target index|}}\\\\n  #{{add index 1}}: {{this.message}}, {{target}}!\\\\n{{/each}}
        | | |  ts(324:687):  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(χ.Globals[\\"each\\"])([\\"world\\", \\"planet\\", \\"universe\\"]));\\\\n    {\\\\n      const [target, index] = 𝛄.blockParams[\\"default\\"];\\\\n      χ.emitContent(χ.resolve(χ.Globals[\\"add\\"])(index, 1));\\\\n      χ.emitContent(χ.resolveOrReturn(𝚪.this.message)());\\\\n      χ.emitContent(χ.resolveOrReturn(target)());\\\\n    }\\\\n    χ.Globals[\\"each\\"];\\\\n  }
        | | |
        | | | | Mapping: PathExpression
        | | | |  hbs(3:7):     each
        | | | |  ts(369:386):  χ.Globals[\\"each\\"]
        | | | |
        | | | | | Mapping: Identifier
        | | | | |  hbs(3:7):     each
        | | | | |  ts(380:384):  each
        | | | | |
        | | | |
        | | | | Mapping: SubExpression
        | | | |  hbs(8:43):    (array \\"world\\" \\"planet\\" \\"universe\\")
        | | | |  ts(388:419):  [\\"world\\", \\"planet\\", \\"universe\\"]
        | | | |
        | | | | | Mapping: StringLiteral
        | | | | |  hbs(15:22):   \\"world\\"
        | | | | |  ts(389:396):  \\"world\\"
        | | | | |
        | | | | | Mapping: StringLiteral
        | | | | |  hbs(23:31):   \\"planet\\"
        | | | | |  ts(398:406):  \\"planet\\"
        | | | | |
        | | | | | Mapping: StringLiteral
        | | | | |  hbs(32:42):   \\"universe\\"
        | | | | |  ts(408:418):  \\"universe\\"
        | | | | |
        | | | |
        | | | | Mapping: Identifier
        | | | |  hbs(48:54):   target
        | | | |  ts(442:448):  target
        | | | |
        | | | | Mapping: Identifier
        | | | |  hbs(55:60):   index
        | | | |  ts(450:455):  index
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(66:67):   #
        | | | |  ts(486:486):
        | | | |
        | | | | Mapping: MustacheStatement
        | | | |  hbs(67:82):   {{add index 1}}
        | | | |  ts(486:544):  χ.emitContent(χ.resolve(χ.Globals[\\"add\\"])(index, 1))
        | | | |
        | | | | | Mapping: PathExpression
        | | | | |  hbs(69:72):   add
        | | | | |  ts(516:532):  χ.Globals[\\"add\\"]
        | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(69:72):   add
        | | | | | |  ts(527:530):  add
        | | | | | |
        | | | | |
        | | | | | Mapping: PathExpression
        | | | | |  hbs(73:78):   index
        | | | | |  ts(534:539):  index
        | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(73:78):   index
        | | | | | |  ts(534:539):  index
        | | | | | |
        | | | | |
        | | | | | Mapping: NumberLiteral
        | | | | |  hbs(79:80):   1
        | | | | |  ts(541:542):  1
        | | | | |
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(82:83):   :
        | | | |  ts(546:546):
        | | | |
        | | | | Mapping: MustacheStatement
        | | | |  hbs(84:100):  {{this.message}}
        | | | |  ts(546:603):  χ.emitContent(χ.resolveOrReturn(𝚪.this.message)())
        | | | |
        | | | | | Mapping: PathExpression
        | | | | |  hbs(86:98):   this.message
        | | | | |  ts(584:599):  𝚪.this.message
        | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(86:90):   this
        | | | | | |  ts(587:591):  this
        | | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(91:98):   message
        | | | | | |  ts(592:599):  message
        | | | | | |
        | | | | |
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(100:101): ,
        | | | |  ts(605:605):
        | | | |
        | | | | Mapping: MustacheStatement
        | | | |  hbs(102:112): {{target}}
        | | | |  ts(605:653):  χ.emitContent(χ.resolveOrReturn(target)())
        | | | |
        | | | | | Mapping: PathExpression
        | | | | |  hbs(104:110): target
        | | | | |  ts(643:649):  target
        | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(104:110): target
        | | | | | |  ts(643:649):  target
        | | | | | |
        | | | | |
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(112:113): !
        | | | |  ts(655:655):
        | | | |
        | | | | Mapping: Identifier
        | | | |  hbs(117:121): each
        | | | |  ts(676:680):  each
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
        |  ts(151:476):  ({} as typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")) {\\\\n  hbs;\\\\n  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(HelperComponent)({ foo: 𝚪.this.bar, ...χ.NamedArgsMarker }));\\\\n    𝛄;\\\\n  }\\\\n  𝚪; χ;\\\\n})
        |
        | | Mapping: Template
        | |  hbs(155:200): <HelperComponent @foo={{this.bar}} />
        | |  ts(345:465):  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(HelperComponent)({ foo: 𝚪.this.bar, ...χ.NamedArgsMarker }));\\\\n    𝛄;\\\\n  }
        | |
        | | | Mapping: TextContent
        | | |  hbs(155:160):
        | | |  ts(345:345):
        | | |
        | | | Mapping: ElementNode
        | | |  hbs(160:197): <HelperComponent @foo={{this.bar}} />
        | | |  ts(345:465):  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(HelperComponent)({ foo: 𝚪.this.bar, ...χ.NamedArgsMarker }));\\\\n    𝛄;\\\\n  }
        | | |
        | | | | Mapping: Identifier
        | | | |  hbs(161:176): HelperComponent
        | | | |  ts(390:405):  HelperComponent
        | | | |
        | | | | Mapping: AttrNode
        | | | |  hbs(177:194): @foo={{this.bar}}
        | | | |  ts(409:425):  foo: 𝚪.this.bar
        | | | |
        | | | | | Mapping: Identifier
        | | | | |  hbs(178:181): foo
        | | | | |  ts(409:412):  foo
        | | | | |
        | | | | | Mapping: MustacheStatement
        | | | | |  hbs(182:194): {{this.bar}}
        | | | | |  ts(414:425):  𝚪.this.bar
        | | | | |
        | | | | | | Mapping: PathExpression
        | | | | | |  hbs(184:192): this.bar
        | | | | | |  ts(414:425):  𝚪.this.bar
        | | | | | |
        | | | | | | | Mapping: Identifier
        | | | | | | |  hbs(184:188): this
        | | | | | | |  ts(417:421):  this
        | | | | | | |
        | | | | | | | Mapping: Identifier
        | | | | | | |  hbs(189:192): bar
        | | | | | | |  ts(422:425):  bar
        | | | | | | |
        | | | | | |
        | | | | |
        | | | |
        | | |
        | | | Mapping: TextContent
        | | |  hbs(197:200):
        | | |  ts(465:465):
        | | |
        | |
        |

        | Mapping: TemplateEmbedding
        |  hbs(295:419): hbs\`\\\\n    <p ...attributes>\\\\n      Hello, {{@foo}}!\\\\n\\\\n      {{! @glint-expect-error: no @bar arg }}\\\\n      {{@bar}}\\\\n    </p>\\\\n  \`
        |  ts(570:1001): ({} as typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")) {\\\\n  hbs;\\\\n  {\\\\n    const 𝛄 = χ.emitElement(\\"p\\");\\\\n    χ.applySplattributes(𝚪.element, 𝛄.element);\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.foo)());\\\\n    // @glint-expect-error\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.bar)());\\\\n  }\\\\n  𝚪; χ;\\\\n})
        |
        | | Mapping: Template
        | |  hbs(299:418): <p ...attributes>\\\\n      Hello, {{@foo}}!\\\\n\\\\n      {{! @glint-expect-error: no @bar arg }}\\\\n      {{@bar}}\\\\n    </p>
        | |  ts(764:990):  {\\\\n    const 𝛄 = χ.emitElement(\\"p\\");\\\\n    χ.applySplattributes(𝚪.element, 𝛄.element);\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.foo)());\\\\n    // @glint-expect-error\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.bar)());\\\\n  }
        | |
        | | | Mapping: TextContent
        | | |  hbs(299:304):
        | | |  ts(764:764):
        | | |
        | | | Mapping: ElementNode
        | | |  hbs(304:415): <p ...attributes>\\\\n      Hello, {{@foo}}!\\\\n\\\\n      {{! @glint-expect-error: no @bar arg }}\\\\n      {{@bar}}\\\\n    </p>
        | | |  ts(764:990):  {\\\\n    const 𝛄 = χ.emitElement(\\"p\\");\\\\n    χ.applySplattributes(𝚪.element, 𝛄.element);\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.foo)());\\\\n    // @glint-expect-error\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.bar)());\\\\n  }
        | | |
        | | | | Mapping: AttrNode
        | | | |  hbs(307:320): ...attributes
        | | | |  ts(803:852):  χ.applySplattributes(𝚪.element, 𝛄.element);
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(328:334): Hello,
        | | | |  ts(853:853):
        | | | |
        | | | | Mapping: MustacheStatement
        | | | |  hbs(335:343): {{@foo}}
        | | | |  ts(853:904):  χ.emitContent(χ.resolveOrReturn(𝚪.args.foo)())
        | | | |
        | | | | | Mapping: PathExpression
        | | | | |  hbs(337:341): @foo
        | | | | |  ts(889:900):  𝚪.args.foo
        | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(338:341): foo
        | | | | | |  ts(897:900):  foo
        | | | | | |
        | | | | |
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(343:344): !
        | | | |  ts(906:906):
        | | | |
        | | | | Mapping: MustacheCommentStatement
        | | | |  hbs(352:391): {{! @glint-expect-error: no @bar arg }}
        | | | |  ts(906:933):  // @glint-expect-error
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(392:398):
        | | | |  ts(933:933):
        | | | |
        | | | | Mapping: MustacheStatement
        | | | |  hbs(398:406): {{@bar}}
        | | | |  ts(933:984):  χ.emitContent(χ.resolveOrReturn(𝚪.args.bar)())
        | | | |
        | | | | | Mapping: PathExpression
        | | | | |  hbs(400:404): @bar
        | | | | |  ts(969:980):  𝚪.args.bar
        | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(401:404): bar
        | | | | | |  ts(977:980):  bar
        | | | | | |
        | | | | |
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(406:411):
        | | | |  ts(986:986):
        | | | |
        | | |
        | | | Mapping: TextContent
        | | |  hbs(415:418):
        | | |  ts(990:990):
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
        |  ts(156:481):  ({} as typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")) {\\\\n  hbs;\\\\n  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(HelperComponent)({ foo: 𝚪.this.bar, ...χ.NamedArgsMarker }));\\\\n    𝛄;\\\\n  }\\\\n  𝚪; χ;\\\\n})
        |
        | | Mapping: Template
        | |  hbs(160:207): <HelperComponent @foo={{this.bar}} />
        | |  ts(350:470):  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(HelperComponent)({ foo: 𝚪.this.bar, ...χ.NamedArgsMarker }));\\\\n    𝛄;\\\\n  }
        | |
        | | | Mapping: TextContent
        | | |  hbs(160:166):
        | | |  ts(350:350):
        | | |
        | | | Mapping: ElementNode
        | | |  hbs(166:203): <HelperComponent @foo={{this.bar}} />
        | | |  ts(350:470):  {\\\\n    const 𝛄 = χ.emitComponent(χ.resolve(HelperComponent)({ foo: 𝚪.this.bar, ...χ.NamedArgsMarker }));\\\\n    𝛄;\\\\n  }
        | | |
        | | | | Mapping: Identifier
        | | | |  hbs(167:182): HelperComponent
        | | | |  ts(395:410):  HelperComponent
        | | | |
        | | | | Mapping: AttrNode
        | | | |  hbs(183:200): @foo={{this.bar}}
        | | | |  ts(414:430):  foo: 𝚪.this.bar
        | | | |
        | | | | | Mapping: Identifier
        | | | | |  hbs(184:187): foo
        | | | | |  ts(414:417):  foo
        | | | | |
        | | | | | Mapping: MustacheStatement
        | | | | |  hbs(188:200): {{this.bar}}
        | | | | |  ts(419:430):  𝚪.this.bar
        | | | | |
        | | | | | | Mapping: PathExpression
        | | | | | |  hbs(190:198): this.bar
        | | | | | |  ts(419:430):  𝚪.this.bar
        | | | | | |
        | | | | | | | Mapping: Identifier
        | | | | | | |  hbs(190:194): this
        | | | | | | |  ts(422:426):  this
        | | | | | | |
        | | | | | | | Mapping: Identifier
        | | | | | | |  hbs(195:198): bar
        | | | | | | |  ts(427:430):  bar
        | | | | | | |
        | | | | | |
        | | | | |
        | | | |
        | | |
        | | | Mapping: TextContent
        | | |  hbs(203:207):
        | | |  ts(470:470):
        | | |
        | |
        |

        | Mapping: TemplateEmbedding
        |  hbs(306:437): hbs\`\\\\r\\\\n    <p ...attributes>\\\\r\\\\n      Hello, {{@foo}}!\\\\r\\\\n\\\\r\\\\n      {{! @glint-expect-error: no @bar arg }}\\\\r\\\\n      {{@bar}}\\\\r\\\\n    </p>\\\\r\\\\n  \`
        |  ts(579:1010): ({} as typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")).templateForBackingValue(this, function(𝚪, χ: typeof import(\\"@norith/glint-environment-glimmerx/-private/dsl\\")) {\\\\n  hbs;\\\\n  {\\\\n    const 𝛄 = χ.emitElement(\\"p\\");\\\\n    χ.applySplattributes(𝚪.element, 𝛄.element);\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.foo)());\\\\n    // @glint-expect-error\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.bar)());\\\\n  }\\\\n  𝚪; χ;\\\\n})
        |
        | | Mapping: Template
        | |  hbs(310:436): <p ...attributes>\\\\r\\\\n      Hello, {{@foo}}!\\\\r\\\\n\\\\r\\\\n      {{! @glint-expect-error: no @bar arg }}\\\\r\\\\n      {{@bar}}\\\\r\\\\n    </p>
        | |  ts(773:999):  {\\\\n    const 𝛄 = χ.emitElement(\\"p\\");\\\\n    χ.applySplattributes(𝚪.element, 𝛄.element);\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.foo)());\\\\n    // @glint-expect-error\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.bar)());\\\\n  }
        | |
        | | | Mapping: TextContent
        | | |  hbs(310:316):
        | | |  ts(773:773):
        | | |
        | | | Mapping: ElementNode
        | | |  hbs(316:432): <p ...attributes>\\\\r\\\\n      Hello, {{@foo}}!\\\\r\\\\n\\\\r\\\\n      {{! @glint-expect-error: no @bar arg }}\\\\r\\\\n      {{@bar}}\\\\r\\\\n    </p>
        | | |  ts(773:999):  {\\\\n    const 𝛄 = χ.emitElement(\\"p\\");\\\\n    χ.applySplattributes(𝚪.element, 𝛄.element);\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.foo)());\\\\n    // @glint-expect-error\\\\n    χ.emitContent(χ.resolveOrReturn(𝚪.args.bar)());\\\\n  }
        | | |
        | | | | Mapping: AttrNode
        | | | |  hbs(319:332): ...attributes
        | | | |  ts(812:861):  χ.applySplattributes(𝚪.element, 𝛄.element);
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(340:347): Hello,
        | | | |  ts(862:862):
        | | | |
        | | | | Mapping: MustacheStatement
        | | | |  hbs(348:356): {{@foo}}
        | | | |  ts(862:913):  χ.emitContent(χ.resolveOrReturn(𝚪.args.foo)())
        | | | |
        | | | | | Mapping: PathExpression
        | | | | |  hbs(350:354): @foo
        | | | | |  ts(898:909):  𝚪.args.foo
        | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(351:354): foo
        | | | | | |  ts(906:909):  foo
        | | | | | |
        | | | | |
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(356:359): !
        | | | |  ts(915:915):
        | | | |
        | | | | Mapping: MustacheCommentStatement
        | | | |  hbs(367:406): {{! @glint-expect-error: no @bar arg }}
        | | | |  ts(915:942):  // @glint-expect-error
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(408:414):
        | | | |  ts(942:942):
        | | | |
        | | | | Mapping: MustacheStatement
        | | | |  hbs(414:422): {{@bar}}
        | | | |  ts(942:993):  χ.emitContent(χ.resolveOrReturn(𝚪.args.bar)())
        | | | |
        | | | | | Mapping: PathExpression
        | | | | |  hbs(416:420): @bar
        | | | | |  ts(978:989):  𝚪.args.bar
        | | | | |
        | | | | | | Mapping: Identifier
        | | | | | |  hbs(417:420): bar
        | | | | | |  ts(986:989):  bar
        | | | | | |
        | | | | |
        | | | |
        | | | | Mapping: TextContent
        | | | |  hbs(422:428):
        | | | |  ts(995:995):
        | | | |
        | | |
        | | | Mapping: TextContent
        | | |  hbs(432:436):
        | | |  ts(999:999):
        | | |
        | |
        |"
      `);
    });
  });
});
