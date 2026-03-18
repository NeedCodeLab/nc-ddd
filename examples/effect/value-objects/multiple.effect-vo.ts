import * as v from "valibot";
import { VO } from "@/core/vo";
import { voEffectFactory } from "@/helpers/vo-effect-factory";

export const MultipleEffectVOSchema = v.variant("type", [
  v.object({
    type: v.literal("email"),
    value: v.pipe(v.string(), v.email("Invalid email")),
  }),
  v.object({
    type: v.literal("foo"),
    value: v.pipe(v.string(), v.url()),
  }),
  v.object({
    type: v.literal("date"),
    value: v.pipe(v.string(), v.isoDate()),
  }),
]);

export type MultipleEffectVOProps = v.InferInput<typeof MultipleEffectVOSchema>;
export class MultipleEffectVO extends VO<typeof MultipleEffectVOSchema> {
  private constructor(props: MultipleEffectVOProps) {
    super(props);
  }

  public static create = (val: MultipleEffectVOProps, key?: string) => {
    return voEffectFactory(val, MultipleEffectVOSchema, (props) => new MultipleEffectVO(props), key);
  };
}
