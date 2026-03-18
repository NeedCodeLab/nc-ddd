import { Entity } from "@/core/entity";
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

export class EmployeeEffect extends Entity<EmployeeProps> {
  private constructor(props: EmployeeProps) {
    super(props);
  }

  public static create(props: EmployeeProps) {
    return new EmployeeEffect(props)
  }
}
