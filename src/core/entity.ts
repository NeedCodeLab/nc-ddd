import type * as v from "valibot";
import type { VO } from "./vo";

export abstract class Entity<
  Props extends Record<string, VO<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>> | VO<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>[]>,
> {
  private _value: Props;

  protected constructor(props: Props) {
    this._value = props;
  }

  get primitive() {
    return Object.fromEntries(Object.entries(this._value).map(([k, v]) => {
      if(Array.isArray(v)) {
        return [k, v.map(i => i.value)]
      }
      return [k, v.value]
    }));
  }
}
