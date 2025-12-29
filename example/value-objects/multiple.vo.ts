import { left, right } from "@sweet-monads/either";
import * as v from "valibot";
import { VO } from "@/core/vo";

export const MultipleVOSchema = v.variant("type", [
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

export type MultipleVOProps = v.InferInput<typeof MultipleVOSchema>;

export class MultipleVO extends VO<typeof MultipleVOSchema> {
  private constructor(props: MultipleVOProps) {
    super(props);
  }

  public static create(value: v.InferInput<typeof MultipleVOSchema>) {
    const parseResult = v.safeParse(MultipleVOSchema, value);
    if (!parseResult.success) {
      const flattedErrors = v.flatten<typeof MultipleVOSchema>(parseResult.issues);
      return left(flattedErrors);
    }
    return right(new MultipleVO(parseResult.output));
  }
}
