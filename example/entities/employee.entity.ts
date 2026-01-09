import { left, merge } from "@sweet-monads/either";
import { flatten, safeParse } from "valibot";
import { Entity } from "@/core/entity";
import { CreateEmployeeDTOSchema } from "../dtos/create-employee.dto";
import { EmployeeContactVO } from "../value-objects/employee/employee-contact.vo";
import { EmployeeInfoVO } from "../value-objects/employee/employee-info.vo";
import { EmployeeNameVO } from "../value-objects/employee/employee-name.vo";
import { EmployeeRoleVO } from "../value-objects/employee/employee-role.vo";
import { IdVO } from "../value-objects/employee/id.vo";

export interface EmployeeProps {
  id: IdVO;
  name: EmployeeNameVO;
  role: EmployeeRoleVO;
  info: EmployeeInfoVO;
  contacts: EmployeeContactVO[];
}

export class Employee extends Entity<EmployeeProps> {
  private constructor(props: EmployeeProps) {
    super(props);
  }

  public static create(rawDTO: unknown) {
    const dtoResult = safeParse(CreateEmployeeDTOSchema, rawDTO);

    if (!dtoResult.success) {
      return left(flatten(dtoResult.issues).nested);
    }

    const props = dtoResult.output;

    const id = IdVO.create(props.id);
    const name = EmployeeNameVO.create(props.name);
    const role = EmployeeRoleVO.create(props.role);
    const info = EmployeeInfoVO.create(props.info);
    const contacts = merge(props.contacts.map((c) => EmployeeContactVO.create(c)));

    return merge([id, name, role, info, contacts]).map(([id, name, role, info, contacts]) => {
      return new Employee({ id, name, role, info, contacts });
    });
  }
}
