import * as v from "valibot";
import { VO } from "@/core/vo";
import { voFactory } from "@/helpers/vo-factory";

const EmployeeNameVOSchema = v.pipe(
  v.string("Name must be a string"),
  v.trim(),
  v.nonEmpty("Name can`t be empty"),
);

export type EmployeeNameVOProps = v.InferOutput<typeof EmployeeNameVOSchema>;

export class EmployeeNameVO extends VO<typeof EmployeeNameVOSchema> {
  private constructor(props: EmployeeNameVOProps) {
    super(props);
  }
  public static create = (val: v.InferInput<typeof EmployeeNameVOSchema>) => {
    return voFactory(val, EmployeeNameVOSchema, (props) => new EmployeeNameVO(props));
  };
}
