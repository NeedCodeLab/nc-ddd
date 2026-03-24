import type { CreateEmployeeDTO } from "./create-employee.dto";

/**
 * Тип для DTO компании.
 * Используется только для типизации входных данных.
 * Валидация происходит на уровне Value Objects.
 */
export interface CreateCompanyDTO {
  id: string;
  companyName: string;
  employees: CreateEmployeeDTO[];
}
