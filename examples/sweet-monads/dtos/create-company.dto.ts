import * as v from "valibot";
import { CreateEmployeeDTOSchema } from "./create-employee.dto";
import { CompanyNameVOSchema } from "../value-objects/company/company-name.vo";
import { IdVOSchema } from "../value-objects/id.vo";

export const CreateCompanyDTOSchema = v.object({
  id: IdVOSchema,
  companyName: CompanyNameVOSchema,
  employees: v.array(CreateEmployeeDTOSchema),
});

export type CreateCompanyDTO = v.InferInput<typeof CreateCompanyDTOSchema>;
