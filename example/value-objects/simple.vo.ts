import * as v from "valibot";
import { VO, voFactory } from "@/core/vo";

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

  public static create = (val: v.InferInput<typeof SimpleVOSchema>) => {
    return voFactory(val, SimpleVOSchema, (props) => new SimpleVO(props));
  };
}
