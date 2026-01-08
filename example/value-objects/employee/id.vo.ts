import * as v from "valibot";
import { VO } from "@/core/vo";
import { voFactory } from "@/helpers/vo-factory";

const IdVOSchema = v.pipe(
  v.string("Id must be a string"),
  v.trim(),
  v.nonEmpty("Id can`t be empty"),
  v.uuid("Invalid Id"),
);

type EmployeeIdVOProps = v.InferOutput<typeof IdVOSchema>;

export class IdVO extends VO<typeof IdVOSchema> {
  private constructor(props: EmployeeIdVOProps) {
    super(props);
  }
  public static create = (val: v.InferInput<typeof IdVOSchema>) => {
    return voFactory(val, IdVOSchema, (props) => new IdVO(props));
  };
}
