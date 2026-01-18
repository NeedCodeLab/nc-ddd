import { left, merge } from "@sweet-monads/either";
import { flatten, safeParse } from "valibot";

import { AgregateRoot } from "@/core/agregate-root";
import { CreateCompanyDTOSchema } from "../dtos/create-company.dto";
import { Employee } from "../entities/employee.entity";
import { CompanyNameVO } from "../value-objects/company/company-name.vo";
import { IdVO } from "../value-objects/id.vo";

export interface CompanyProps {
  id: IdVO;
  companyName: CompanyNameVO;
  employees: Employee[];
}

export class Company extends AgregateRoot<CompanyProps> {
  private constructor(props: CompanyProps) {
    super(props);
  }

  public static create(rawDTO: unknown) {
    const dtoResult = safeParse(CreateCompanyDTOSchema, rawDTO);

    if (!dtoResult.success) {
      return left(flatten(dtoResult.issues).nested);
    }

    const props = dtoResult.output;

    const id = IdVO.create(props.id);
    const companyName = CompanyNameVO.create(props.companyName);
    const employees = merge(props.employees.map((e) => Employee.create(e)));

    return merge([id, companyName, employees]).map(([id, companyName, employees]) => {
      return new Company({ id, companyName, employees });
    });
  }
}
