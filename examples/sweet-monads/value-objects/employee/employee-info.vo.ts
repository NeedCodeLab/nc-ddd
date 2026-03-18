import * as v from "valibot";
import { VO } from "@/core/vo";
import { voFactory } from "@/helpers/vo-factory";

export const EmployeeInfoVOSchema = v.pipe(
  v.string("Info must be a string"),
  v.trim(),
  v.nonEmpty("Info can`t be empty"),
  v.maxLength(300, "Info can`t be more then 300 letters"),
);

type EmployeeInfoVOProps = v.InferOutput<typeof EmployeeInfoVOSchema>;

export class EmployeeInfoVO extends VO<typeof EmployeeInfoVOSchema> {
  private constructor(props: EmployeeInfoVOProps) {
    super(props);
  }
  public static create = (val: v.InferInput<typeof EmployeeInfoVOSchema>, key: string) => {
    return voFactory(val, EmployeeInfoVOSchema, (props) => new EmployeeInfoVO(props), key);
  };
}
