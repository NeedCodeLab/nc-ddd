import * as v from "valibot";
import { EmployeeContactVOSchema } from "../value-objects/employee/employee-contact.vo";
import { EmployeeInfoVOSchema } from "../value-objects/employee/employee-info.vo";
import { EmployeeLastNameVOSchema } from "../value-objects/employee/employee-last-name.vo";
import { EmployeeNameVOSchema } from "../value-objects/employee/employee-name.vo";
import { RoleVOSchema } from "../value-objects/employee/employee-role.vo";
import { IdVOSchema } from "../value-objects/id.vo";

export const CreateEmployeeDTOSchema = v.object({
  id: IdVOSchema,
  name: EmployeeNameVOSchema,
  lastName: v.nullish(EmployeeLastNameVOSchema),
  role: RoleVOSchema,
  info: EmployeeInfoVOSchema,
  contacts: v.array(EmployeeContactVOSchema),
});

export type CreateEmployeeDTO = v.InferInput<typeof CreateEmployeeDTOSchema>;
