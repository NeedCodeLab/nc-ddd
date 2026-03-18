import * as v from "valibot";
import { VO } from "@/core/vo";
import { voFactory } from "@/helpers/vo-factory";

export enum RoleEnum {
  staff = "staff",
  admin = "admin",
}
export const RoleVOSchema = v.enum_(RoleEnum);
type LeagueRoleVOProps = v.InferInput<typeof RoleVOSchema>;

export class EmployeeRoleVO extends VO<typeof RoleVOSchema> {
  private constructor(props: LeagueRoleVOProps) {
    super(props);
  }
  public static create = (val: v.InferInput<typeof RoleVOSchema>, key: string) => {
    return voFactory(val, RoleVOSchema, (props) => new EmployeeRoleVO(props), key);
  };
}
