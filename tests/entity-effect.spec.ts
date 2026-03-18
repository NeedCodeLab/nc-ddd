import { randomUUID } from "node:crypto";
import { Effect, Either, pipe } from "effect";
import { effectMapOptional } from "@/helpers/effect-map-optional";
import { extractEffectErrors } from "@/helpers/extract-effect-errors";
import { EmployeeEffect } from "../examples/effect/entities/employee.effect-entity";
import {
  EmployeeContactVO,
  type EmployeeContactVOProps,
} from "../examples/effect/value-objects/employee/employee-contact.vo";
import { EmployeeInfoVO } from "../examples/effect/value-objects/employee/employee-info.vo";
import { EmployeeLastNameVO } from "../examples/effect/value-objects/employee/employee-last-name.vo";
import { EmployeeNameVO } from "../examples/effect/value-objects/employee/employee-name.vo";
import {
  EmployeeRoleVO,
  RoleEnum,
} from "../examples/effect/value-objects/employee/employee-role.vo";
import { IdVO } from "../examples/effect/value-objects/id.vo";

// ─── Типы ────────────────────────────────────────────────────────────────────

type EmployeeProps = {
  id: string;
  name: string;
  lastName: string | null;
  role: RoleEnum;
  info: string; // намеренно допускаем невалидный тип для тестов
  contacts: EmployeeContactVOProps[];
};

// ─── Фабрика ─────────────────────────────────────────────────────────────────

function createEntity(props: EmployeeProps) {
  return pipe(
    Effect.all(
      {
        id: IdVO.create(props.id),
        name: EmployeeNameVO.create(props.name),
        lastName: effectMapOptional(props.lastName, (v) => EmployeeLastNameVO.create(v)),
        role: EmployeeRoleVO.create(props.role),
        info: EmployeeInfoVO.create(props.info as any),
        contacts: Effect.all(
          props.contacts.map((contact, i) => EmployeeContactVO.create(contact, `contacts.${i}`)),
          { mode: "validate" },
        ),
      },
      { mode: "validate" }, // собираем ВСЕ ошибки, не останавливаемся на первой
    ),
    Effect.mapError((cause) => extractEffectErrors(cause)),
    Effect.map((data) =>
      EmployeeEffect.create({
        id: data.id,
        name: data.name,
        info: data.info,
        role: data.role,
        contacts: data.contacts,
        lastName: data.lastName ?? null,
      }),
    ),
    // Effect.tap((cause) => Effect.log(cause)),
    Effect.either, // оборачиваем в Either — runSync не бросит исключение
    Effect.runSync,
  );
}

// ─── Фикстуры ────────────────────────────────────────────────────────────────

const invalidProps: EmployeeProps = {
  id: randomUUID(),
  name: "", // невалидно: пустая строка
  lastName: 123 as any,
  role: RoleEnum.staff,
  info: 1 as any, // невалидно: число вместо строки
  contacts: [
    { type: "email", value: "maile@mail.ru" },
    { type: "email", value: "mailemail.ru" },
  ],
};

const validProps: EmployeeProps = {
  id: randomUUID(),
  name: "John",
  lastName: null,
  role: RoleEnum.staff,
  info: "A valuable team member.",
  contacts: [{ type: "email", value: "mail@email.ru" }],
};

// ─── Тесты ───────────────────────────────────────────────────────────────────

describe("Entity implementation tests", () => {
  describe("невалидные пропсы", () => {
    it("должен вернуть Left с ошибками", () => {
      const result = createEntity(invalidProps);

      expect(Either.isLeft(result)).toBe(true);
    });

    it("должен содержать ошибку для поля name", () => {
      const result = createEntity(invalidProps);

      if (Either.isLeft(result)) {
        expect(result.left).toMatchObject({
          name: expect.any(Array),
        });
        expect(result.left?.name?.length).toBeGreaterThan(0);
      }
    });

    it("должен содержать ошибку для поля info", () => {
      const result = createEntity(invalidProps);

      if (Either.isLeft(result)) {
        expect(result.left).toMatchObject({
          info: expect.any(Array),
        });
        expect(result.left?.info?.length).toBeGreaterThan(0);
      }
    });

    it("должен собрать ВСЕ ошибки сразу (не останавливаться на первой)", () => {
      const result = createEntity(invalidProps);

      if (Either.isLeft(result)) {
        // name и info оба невалидны — оба должны присутствовать
        expect(result.left).toEqual({
          name: ["Name can`t be empty"],
          lastName: ["Lastname must be a string"],
          info: ["Info must be a string"],
          "contacts.1.value": ["Invalid email"],
        });
      }
    });
  });

  describe("валидные пропсы", () => {
    it("должен вернуть Right с данными", () => {
      const result = createEntity(validProps);

      expect(Either.isRight(result)).toBe(true);
    });

    it("должен содержать корректные данные сущности", () => {
      const result = createEntity(validProps);

      if (Either.isRight(result)) {
        expect(result.right.primitive).toMatchObject({
          name: "John",
          lastName: null,
          role: RoleEnum.staff,
          info: "A valuable team member.",
          contacts: [{ type: "email", value: "mail@email.ru" }],
        });
      }
    });
  });
});
