import * as v from "valibot"; // Добавлен импорт * as v
import { VO } from "@/core/vo";
import { voFactory } from "@/helpers/vo-factory";

export enum RoleEnum {
  staff = "staff",
  admin = "admin",
}
export const RoleVOSchema = v.enum_(RoleEnum); // Исправлено определение схемы
type LeagueRoleVOProps = v.InferInput<typeof RoleVOSchema>;

export class EmployeeRoleVO extends VO<typeof RoleVOSchema> {
  private constructor(props: LeagueRoleVOProps) {
    super(props);
  }
  public static create = (val: v.InferInput<typeof RoleVOSchema>) => {
    return voFactory(val, RoleVOSchema, (props) => new EmployeeRoleVO(props));
  };
}
