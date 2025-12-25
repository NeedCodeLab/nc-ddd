import * as v from "valibot";
import { createValueObjectFactory, ValueObject } from "@/core/value-object";

export const SimpleVOSchema = v.pipe(
  v.string("It must be a string"),
  v.trim(),
  v.nonEmpty("It can`t be empty"),
);

export type SimpleVOProps = v.InferOutput<typeof SimpleVOSchema>;

export class SimpleVO extends ValueObject<SimpleVOProps> {
  private constructor(props: SimpleVOProps) {
    super(props);
  }

  public static create = createValueObjectFactory(SimpleVOSchema, (props) => new SimpleVO(props));
}
