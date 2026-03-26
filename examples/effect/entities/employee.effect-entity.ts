import { Effect, pipe } from "effect";
import { EntityEffect } from "@/effect/core/entity-effect";
import { EmployeeContactVO } from "../value-objects/employee/employee-contact.vo";
import { EmployeeInfoVO } from "../value-objects/employee/employee-info.vo";
import { EmployeeLastNameVO } from "../value-objects/employee/employee-last-name.vo";
import { EmployeeNameVO } from "../value-objects/employee/employee-name.vo";
import { EmployeeRoleVO } from "../value-objects/employee/employee-role.vo";
import { IdVO } from "../value-objects/id.vo";
import { DuplicateContactError } from "@/errors/business-rule.error";
import { CreateEmployeeDTO } from "../dtos/create-employee.dto";
import { effectMapOptional } from "@/helpers/effect-map-optional";
import { extractValidationError } from "@/helpers/extract-validation-errors";

export interface EmployeeProps {
  id: IdVO;
  name: EmployeeNameVO;
  lastName: EmployeeLastNameVO | null;
  role: EmployeeRoleVO;
  info: EmployeeInfoVO;
  contacts: EmployeeContactVO[];
}

export class EmployeeEffect extends EntityEffect<EmployeeProps> {
  private constructor(props: EmployeeProps) {
    super(props);
  }

  /**
   * Фабричный метод для создания EmployeeEffect.
   * Валидирует все поля и создаёт сущность.
   * @param props — свойства сотрудника
   * @returns Effect с EmployeeEffect или ошибкой валидации
   */
  public static create(props: EmployeeProps): Effect.Effect<EmployeeEffect, never> {
    return Effect.succeed(new EmployeeEffect(props))
  }

  public static createFromDTO(dto: CreateEmployeeDTO) {
    return pipe(
      Effect.all({
        id: IdVO.create(dto.id, "id"),
        name: EmployeeNameVO.create(dto.name, "name"),
        lastName: effectMapOptional(dto.lastName, () => EmployeeLastNameVO.create(dto.lastName, "lastName")),
        role: EmployeeRoleVO.create(dto.role, "role"),
        info: EmployeeInfoVO.create(dto.info, "info"),
        contacts: Effect.all(
          dto.contacts.map((contact, i) => EmployeeContactVO.create(contact, `contacts.${i}`)),
          { mode: "validate" },
        ),
      }, { mode: "validate" }),
      Effect.mapError((cause) => extractValidationError(cause)),
      // Проверка на дублирование типов контактов
      Effect.filterOrFail(
        (data) => {
          const contactTypes = data.contacts.map((c) => c.primitive.type);
          const uniqueTypes = new Set(contactTypes);
          return contactTypes.length === uniqueTypes.size;
        },
        (data) => {
          const contactTypes = data.contacts.map((c) => c.primitive.type);
          const duplicates = contactTypes.filter(
            (type, index) => contactTypes.indexOf(type) !== index,
          );
          const duplicateType = duplicates[0] ?? "unknown";
          return new DuplicateContactError(duplicateType);
        },
      ),
      Effect.flatMap((data) => EmployeeEffect.create({
        ...data,
        lastName: data.lastName ?? null
      }))
    )
  }
}
