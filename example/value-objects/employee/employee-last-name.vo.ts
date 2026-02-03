import * as v from "valibot";
import { VO } from "@/core/vo";
import { voFactory } from "@/helpers/vo-factory";

export const EmployeeLastNameVOSchema = v.pipe(
  v.string("Lastname must be a string"),
  v.trim(),
  v.nonEmpty("Lastname can`t be empty"),
);

export type EmployeeLastNameVOProps = v.InferOutput<typeof EmployeeLastNameVOSchema>;

export class EmployeeLastNameVO extends VO<typeof EmployeeLastNameVOSchema> {
  private constructor(props: EmployeeLastNameVOProps) {
    super(props);
  }
  public static create = (val: v.InferInput<typeof EmployeeLastNameVOSchema>) => {
    return voFactory(val, EmployeeLastNameVOSchema, (props) => new EmployeeLastNameVO(props));
  };
}
