import { left, merge, mergeInMany, right } from "@sweet-monads/either";
import { Entity } from "@/core/entity";
import type { CreateEmployeeDTO } from "../dtos/create-employee.dto";
import { EmployeeContactVO } from "../value-objects/employee/employee-contact.vo";
import { EmployeeInfoVO } from "../value-objects/employee/employee-info.vo";
import { EmployeeLastNameVO } from "../value-objects/employee/employee-last-name.vo";
import { EmployeeNameVO } from "../value-objects/employee/employee-name.vo";
import { EmployeeRoleVO } from "../value-objects/employee/employee-role.vo";
import { IdVO } from "../value-objects/id.vo";

export interface EmployeeProps {
  id: IdVO;
  name: EmployeeNameVO;
  lastName: EmployeeLastNameVO | null;
  role: EmployeeRoleVO;
  info: EmployeeInfoVO;
  contacts: EmployeeContactVO[];
}

export class Employee extends Entity<EmployeeProps> {
  private constructor(props: EmployeeProps) {
    super(props);
  }

  public static create(rawDTO: unknown, key?: string) {
    const props = rawDTO as CreateEmployeeDTO;

    const id = IdVO.create(props.id, "id");
    const name = EmployeeNameVO.create(props.name, "name");
    const lastName = props.lastName
      ? EmployeeLastNameVO.create(props.lastName, "lastName")
      : right(null);
    const role = EmployeeRoleVO.create(props.role, "role");
    const info = EmployeeInfoVO.create(props.info, "info");
    const contacts = merge(
      props.contacts.map((c, idx) => EmployeeContactVO.create(c, `contacts.${idx}`)),
    );

    return mergeInMany([id, name, role, info, contacts, lastName]).fold(
      (e) => {
        const errors = Object.assign({}, ...e);
        return left(key ? { [key]: errors } : errors);
      },
      ([id, name, role, info, contacts, lastName]) => {
        const empl = new Employee({ id, name, role, info, contacts, lastName });
        return right(empl);
      },
    );
  }
}
