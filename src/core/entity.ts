import type * as v from "valibot";
import type { VO } from "./vo";

export abstract class Entity<
  Props extends Record<
    string,
    | VO<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>
    | VO<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>[]
  >,
> {
  private _value: Props;

  protected constructor(props: Props) {
    this._value = props;
  }

  get primitive() {
    return Object.fromEntries(
      Object.entries(this._value).map(([k, v]) => {
        if (Array.isArray(v)) {
          return [k, v.map((i) => i.value)];
        }
        return [k, v.value];
      }),
    );
  }

  get value() {
    return this._value;
  }
}

export type InferValibot<T> =
  T extends ReadonlyArray<infer U>
    ? InferValibot<U>[]
    : T extends VO<infer S>
      ? v.InferInput<S>
      : never;

export type InferEntityProps<T> = {
  [K in keyof T]: InferValibot<T[K]>;
};
