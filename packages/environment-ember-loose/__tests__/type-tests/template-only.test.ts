import templateOnlyComponent from '@ember/component/template-only';
import {
  templateForBackingValue,
  resolve,
  emitComponent,
  NamedArgsMarker,
} from '@norith/glint-environment-ember-loose/-private/dsl';
import { expectTypeOf } from 'expect-type';
import { ComponentLike, WithBoundArgs } from '@norith/glint-template';

{
  const NoArgsComponent = templateOnlyComponent();

  resolve(NoArgsComponent)(
    // @ts-expect-error: extra positional arg
    'oops'
  );

  {
    const component = emitComponent(resolve(NoArgsComponent)());

    {
      // @ts-expect-error: never yields, so shouldn't accept blocks
      component.blockParams.default;
    }
  }

  emitComponent(resolve(NoArgsComponent)());

  templateForBackingValue(NoArgsComponent, function (𝚪) {
    expectTypeOf(𝚪.this).toBeNull();
    expectTypeOf(𝚪.args).toEqualTypeOf<{}>();
    expectTypeOf(𝚪.element).toBeUnknown();
    expectTypeOf(𝚪.blocks).toEqualTypeOf<{}>();
  });
}

{
  interface YieldingComponentSignature {
    Element: HTMLImageElement;
    Args: {
      values: Array<number>;
    };
    Blocks: {
      default: [number];
      else: [];
    };
  }

  const YieldingComponent = templateOnlyComponent<YieldingComponentSignature>();

  resolve(YieldingComponent)(
    // @ts-expect-error: missing required arg
    { ...NamedArgsMarker }
  );

  resolve(YieldingComponent)({
    // @ts-expect-error: incorrect type for arg
    values: 'hello',
    ...NamedArgsMarker,
  });

  resolve(YieldingComponent)({
    values: [1, 2, 3],
    // @ts-expect-error: extra arg
    oops: true,
    ...NamedArgsMarker,
  });

  {
    const component = emitComponent(
      resolve(YieldingComponent)({ values: [1, 2, 3], ...NamedArgsMarker })
    );
    const [value] = component.blockParams.default;
    expectTypeOf(value).toEqualTypeOf<number>();
  }

  {
    const component = emitComponent(
      resolve(YieldingComponent)({ values: [1, 2, 3], ...NamedArgsMarker })
    );

    {
      const [...args] = component.blockParams.default;
      expectTypeOf(args).toEqualTypeOf<[number]>();
    }

    {
      const [...args] = component.blockParams.else;
      expectTypeOf(args).toEqualTypeOf<[]>();
    }
  }

  templateForBackingValue(YieldingComponent, function (𝚪) {
    expectTypeOf(𝚪.this).toBeNull();
    expectTypeOf(𝚪.args).toEqualTypeOf<YieldingComponentSignature['Args']>();
    expectTypeOf(𝚪.element).toEqualTypeOf<YieldingComponentSignature['Element']>();
    expectTypeOf(𝚪.blocks).toEqualTypeOf<YieldingComponentSignature['Blocks']>();
  });
}

// Template-only components are `ComponentLike`
{
  interface TestSignature {
    Args: {
      item: string;
    };
    Blocks: {
      default: [greeting: string];
    };
    Element: HTMLParagraphElement;
  }

  const BasicTOC = templateOnlyComponent<TestSignature>();
  expectTypeOf(BasicTOC).toMatchTypeOf<ComponentLike<TestSignature>>();

  // and therefore works correctly with `WithBoundArgs`
  expectTypeOf<WithBoundArgs<typeof BasicTOC, 'item'>>().not.toBeNever();
}
