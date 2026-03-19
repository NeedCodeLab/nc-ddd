import * as v from "valibot";
import { VO } from "@/core/vo";
import { voEffectFactory } from "@/helpers/vo-effect-factory";
import {  Either } from "effect/index";
import { left, right } from "effect/Either";

export const EmployeeNameVOSchema = v.pipe(
  v.string("Name must be a string"),
  v.trim(),
  v.nonEmpty("Name can`t be empty"),
);

export type EmployeeNameVOProps = v.InferOutput<typeof EmployeeNameVOSchema>;

export class EmployeeNameVO extends VO<typeof EmployeeNameVOSchema> {
  private constructor(props: EmployeeNameVOProps) {
    super(props);
  }
  public static create = (val: v.InferInput<typeof EmployeeNameVOSchema>, key?: string) => {
    return Either.flatMap(
      voEffectFactory(val, EmployeeNameVOSchema, (props) => new EmployeeNameVO(props), key),
      (vo)=>{
        if(vo.value.length > 20) {
          return left(["Имя слишком длинное (макс. 20 символов)"])
        }
        return right(vo)
      })
  };
}
