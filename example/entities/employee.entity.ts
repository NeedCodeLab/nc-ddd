import { Entity, type InferEntityProps } from "@/core/entity";
import { entityFactory, type InferPropsFromClasses } from "@/helpers/entity-factory";

import { EmployeeContactVO } from "../value-objects/employee/employee-contact.vo";
import { EmployeeInfoVO } from "../value-objects/employee/employee-info.vo";
import { EmployeeNameVO } from "../value-objects/employee/employee-name.vo";
import { EmployeeRoleVO } from "../value-objects/employee/employee-role.vo";

const EntitySchema = {
  name: EmployeeNameVO,
  info: EmployeeInfoVO,
  contacts: [EmployeeContactVO],
  role: EmployeeRoleVO,
} as const;

type EmployeeEntityProps = InferPropsFromClasses<typeof EntitySchema>;
type EmployeeDTO = InferEntityProps<EmployeeEntityProps>;

export class EmployeeEntity extends Entity<EmployeeEntityProps> {
  static create(dto: EmployeeDTO) {
    return entityFactory(dto, EntitySchema, (props) => new EmployeeEntity(props));
  }
}
