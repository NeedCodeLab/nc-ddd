/**
 * Тип для DTO сотрудника.
 * Используется только для типизации входных данных.
 * Валидация происходит на уровне Value Objects.
 */
export interface CreateEmployeeDTO {
  id: string;
  name: string;
  lastName?: string | null;
  role: string;
  info: string;
  contacts: Array<{ type: string; value: string }>;
}
