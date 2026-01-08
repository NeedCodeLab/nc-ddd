import * as v from "valibot";
import { VO } from "@/core/vo";
import { voFactory } from "@/helpers/vo-factory";

export const EmployeeContactVOSchema = v.variant("type", [
  v.object({
    type: v.literal("email"),
    value: v.pipe(
      v.string("Email must be a string"),
      v.nonEmpty("Can`t be empty"),
      v.email("Invalid email"),
    ),
  }),
  v.object({
    type: v.literal("phone"),
    value: v.pipe(v.string(), v.regex(/^7\d{10}$/, "Invalid phone format")),
  }),
]);

export type EmployeeContactVOProps = v.InferInput<typeof EmployeeContactVOSchema>;

export class EmployeeContactVO extends VO<typeof EmployeeContactVOSchema> {
  private constructor(props: EmployeeContactVOProps) {
    super(props);
  }

  public static create = (val: v.InferInput<typeof EmployeeContactVOSchema>) => {
    return voFactory(val, EmployeeContactVOSchema, (props) => new EmployeeContactVO(props));
  };
}
