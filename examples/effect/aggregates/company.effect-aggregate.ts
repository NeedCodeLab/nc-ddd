import { AggregateRoot } from "@/core/aggregate-root";
import { EmployeeEffect } from "../entities/employee.effect-entity";
import { CompanyNameVO } from "../value-objects/company/company-name.vo";
import { IdVO } from "../value-objects/id.vo";

export interface CompanyProps {
  id: IdVO;
  companyName: CompanyNameVO;
  employees: EmployeeEffect[];
}

export class CompanyEffect extends AggregateRoot<CompanyProps> {
  private constructor(props: CompanyProps) {
    super(props);
  }

  public static create(props: CompanyProps) {
    return new CompanyEffect(props)
  }
}
