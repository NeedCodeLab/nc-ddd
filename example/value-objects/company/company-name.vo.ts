import * as v from "valibot";
import { VO } from "@/core/vo";
import { voFactory } from "@/helpers/vo-factory";

export const CompanyNameVOSchema = v.pipe(
  v.string("Name must be a string"),
  v.trim(),
  v.nonEmpty("Name can`t be empty"),
);

export type CompanyNameVOProps = v.InferOutput<typeof CompanyNameVOSchema>;

export class CompanyNameVO extends VO<typeof CompanyNameVOSchema> {
  private constructor(props: CompanyNameVOProps) {
    super(props);
  }
  public static create = (val: v.InferInput<typeof CompanyNameVOSchema>) => {
    return voFactory(val, CompanyNameVOSchema, (props) => new CompanyNameVO(props));
  };
}
