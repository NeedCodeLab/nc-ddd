import { Entity, type InferEntityProps } from "@/core/entity";
import { type EntityPropsCreators, entityFactory } from "@/helpers/entity-factory";

import { EmployeeContactVO } from "../value-objects/employee/employee-contact.vo";
import { EmployeeInfoVO } from "../value-objects/employee/employee-info.vo";
import { EmployeeNameVO } from "../value-objects/employee/employee-name.vo";
import { EmployeeRoleVO } from "../value-objects/employee/employee-role.vo";

type EmployeeEntityProps = {
  name: EmployeeNameVO;
  info: EmployeeInfoVO;
  contacts: EmployeeContactVO[];
  role: EmployeeRoleVO;
};

type EmployeeDTO = InferEntityProps<EmployeeEntityProps>;

const creators: EntityPropsCreators<EmployeeEntityProps, EmployeeDTO> = {
  name: EmployeeNameVO.create,
  info: EmployeeInfoVO.create,
  contacts: EmployeeContactVO.create,
  role: EmployeeRoleVO.create,
};

export class EmployeeEntity extends Entity<EmployeeEntityProps> {
  static create(dto: EmployeeDTO) {
    return entityFactory(dto, creators, (props) => new EmployeeEntity(props));
  }
}
