import assert from "node:assert/strict";
import { left, right } from "@sweet-monads/either";
import * as v from "valibot";

export abstract class VO<Schema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>> {
  private _value: v.InferOutput<Schema>;

  protected constructor(props: v.InferOutput<Schema>) {
    this._value = props;
  }

  isEqual(other: VO<Schema>) {
    try {
      assert.deepStrictEqual(other.value, this.value);
      return true;
    } catch {
      return false;
    }
  }

  get value() {
    return this._value;
  }
}

export function voFactory<S extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(
  value: v.InferInput<typeof schema>,
  schema: S,
  constructorFn: (props: v.InferOutput<S>) => VO<S>,
) {
  const parseResult = v.safeParse(schema, value);
  if (!parseResult.success) {
    const flattedErrors = v.flatten<typeof schema>(parseResult.issues);
    return left(flattedErrors);
  }
  return right(constructorFn(parseResult.output));
}
