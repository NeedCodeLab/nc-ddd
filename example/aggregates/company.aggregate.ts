import { left, merge, mergeInMany, right } from "@sweet-monads/either";

import { AggregateRoot } from "@/core/aggregate-root";
import type { CreateCompanyDTO } from "../dtos/create-company.dto";
import { Employee } from "../entities/employee.entity";
import { CompanyNameVO } from "../value-objects/company/company-name.vo";
import { IdVO } from "../value-objects/id.vo";

export interface CompanyProps {
  id: IdVO;
  companyName: CompanyNameVO;
  employees: Employee[];
}

export class Company extends AggregateRoot<CompanyProps> {
  private constructor(props: CompanyProps) {
    super(props);
  }

  public static create(rawDTO: unknown) {
    const props = rawDTO as CreateCompanyDTO;

    const id = IdVO.create(props.id, "id");
    const companyName = CompanyNameVO.create(props.companyName, "companyName");
    const employees = merge(
      props.employees.map((em, idx) => Employee.create(em, `employees.${idx}`)),
    );

    return mergeInMany([id, companyName, employees]).fold(
      (e) => {
        const errors = Object.assign({}, ...e);
        return left(errors);
      },
      ([id, companyName, employees]) => {
        const league = new Company({ id, companyName, employees });
        return right(league);
      },
    );
  }
}
