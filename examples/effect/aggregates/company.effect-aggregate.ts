import { Effect, pipe } from "effect";
import { AggregateRootEffect } from "@/effect/core/aggregate-root-effect";
import { EmployeeEffect } from "../entities/employee.effect-entity";
import { CompanyNameVO } from "../value-objects/company/company-name.vo";
import { IdVO } from "../value-objects/id.vo";
import { CreateEmployeeDTO } from "../dtos/create-employee.dto";
import { MaxEmployeesError } from "@/errors/business-rule.error";
import { extractValidationError } from "@/helpers/extract-validation-errors";

const MAX_EMPLOYEES = 3;

export interface CompanyProps {
  id: IdVO;
  companyName: CompanyNameVO;
  employees: EmployeeEffect[];
}

export class CompanyEffect extends AggregateRootEffect<CompanyProps> {
  private constructor(props: CompanyProps) {
    super(props);
  }

  /**
   * Фабричный метод для создания CompanyEffect.
   * Валидирует все поля и создаёт агрегат.
   * @param props — свойства компании
   * @returns Effect с CompanyEffect или ошибкой валидации
   */
  public static create(props: CompanyProps): Effect.Effect<CompanyEffect> {
    return Effect.succeed(new CompanyEffect(props))
  }
  public static createFromDTO(dto: {
    id: string,
    companyName: string,
    employees: CreateEmployeeDTO[]
  }){
    return pipe(
      Effect.all({
        id: IdVO.create(dto.id, "id"),
        companyName: CompanyNameVO.create(dto.companyName, "companyName"),
        employees: Effect.all(
          dto.employees.map((emp) =>
              EmployeeEffect.createFromDTO(emp),
          ),
          { mode: "validate" },
        ),
      }, { mode: "validate" }),
      Effect.mapError((cause) => extractValidationError(cause)),
      Effect.filterOrFail(
        (data) => data.employees.length <= MAX_EMPLOYEES,
        () => new MaxEmployeesError(MAX_EMPLOYEES, dto.employees.length)
      ),
      Effect.flatMap((data) => CompanyEffect.create({
        ...data
      }))
    )
  }
}
