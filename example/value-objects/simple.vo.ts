import { left, right } from "@sweet-monads/either";
import * as v from "valibot";
import { VO } from "@/core/vo";

export const SimpleVOSchema = v.pipe(
  v.string("It must be a string"),
  v.trim(),
  v.nonEmpty("It can`t be empty"),
);

export type SimpleVOProps = v.InferOutput<typeof SimpleVOSchema>;

export class SimpleVO extends VO<typeof SimpleVOSchema> {
  private constructor(props: SimpleVOProps) {
    super(props);
  }

  public static create(value: v.InferInput<typeof SimpleVOSchema>) {
    const parseResult = v.safeParse(SimpleVOSchema, value);
    if (!parseResult.success) {
      const flattedErrors = v.flatten<typeof SimpleVOSchema>(parseResult.issues);
      return left(flattedErrors);
    }
    return right(new SimpleVO(parseResult.output));
  }
}
