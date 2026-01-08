import assert from "node:assert/strict";
import type * as v from "valibot";

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
