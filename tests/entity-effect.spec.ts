import { randomUUID } from "node:crypto";
import { tapErrorTag } from "effect/Effect";
import { Effect, pipe } from "effect/index";
import type { EffectValidationError } from "@/index";
import { EmployeeEffect } from "../examples/effect/entities/employee.effect-entity";
import { RoleEnum } from "../examples/effect/value-objects/employee/employee-role.vo";

describe("Entity implementation tests", () => {
  const employeeId1 = randomUUID();
  // const employeeId2 = randomUUID();

  const validEmployeeProps = {
    id: employeeId1,
    name: "John Doe",
    role: RoleEnum.staff,
    info: "A valuable team member.",
    contacts: [{ type: "email" as const, value: "john.doe@example.com" }],
  };
  const invalidEmployeeProps = {
    id: employeeId1,
    name: "",
    role: RoleEnum.staff,
    // biome-ignore lint/suspicious/noExplicitAny: <for tests>
    info: 1 as any,
    contacts: [{ type: "email" as const, value: "john.doeexample.com" }],
  };
  it("should throw error an entity with valid properties", () => {
    pipe(
      EmployeeEffect.createFromDTO(validEmployeeProps),
      Effect.match({
        onFailure: (_e) => {
          fail("Expected a Right, but received a Left");
        },
        onSuccess: (employee) => {
          expect(employee.primitive).toEqual({
            id: employeeId1,
            name: "John Doe",
            role: "staff",
            info: "A valuable team member.",
            contacts: [{ type: "email", value: "john.doe@example.com" }],
            lastName: null,
          });
        },
      }),
      Effect.runSync,
    );
  });
  it("should throw error an entity with invalid properties", () => {
    pipe(
      EmployeeEffect.createFromDTO(invalidEmployeeProps),
      tapErrorTag("EffectValidationError", (e) => {
        expect(e.errors).toBeDefined();
        expect(e.errors).toEqual({
          name: ["Name cannot be empty"],
          info: ["Info must be a string"],
          "contacts.0": ["Invalid email format"],
        });
        return e;
      }),
      Effect.match({
        onFailure: (error) => {
          expect(error._tag === "EffectValidationError").toBeTruthy();
          const e = error as EffectValidationError;
          expect(e.errors).toEqual({
            "contacts.0": ["Invalid email format"],
            info: ["Info must be a string"],
            name: ["Name cannot be empty"],
          });
        },
        onSuccess: () => {
          fail("Expected a Right, but received a Left");
        },
      }),
      Effect.runSync,
    );
  });

  it("should create employee with unique contact types", () => {
    const employeeWithUniqueContacts = {
      id: employeeId1,
      name: "John Doe",
      role: RoleEnum.staff,
      info: "A valuable team member.",
      contacts: [
        { type: "email" as const, value: "john.doe@example.com" },
        { type: "phone" as const, value: "79001234567" },
      ],
    };

    pipe(
      EmployeeEffect.createFromDTO(employeeWithUniqueContacts),
      Effect.match({
        onFailure: () => {
          fail("Expected success, but received an error");
        },
        onSuccess: (employee) => {
          expect(employee.primitive.contacts).toHaveLength(2);
          // biome-ignore lint/style/noNonNullAssertion: <test knows contacts exist>
          expect(employee.primitive.contacts[0]!.type).toBe("email");
          // biome-ignore lint/style/noNonNullAssertion: <test knows contacts exist>
          expect(employee.primitive.contacts[1]!.type).toBe("phone");
        },
      }),
      Effect.runSync,
    );
  });

  it("should fail to create employee with duplicate email contacts (BusinessRuleError)", () => {
    const employeeWithDuplicateEmails = {
      id: employeeId1,
      name: "John Doe",
      role: RoleEnum.staff,
      info: "A valuable team member.",
      contacts: [
        { type: "email" as const, value: "john.doe@example.com" },
        { type: "email" as const, value: "j.doe@example.com" },
      ],
    };

    pipe(
      EmployeeEffect.createFromDTO(employeeWithDuplicateEmails),
      Effect.match({
        onFailure: (error) => {
          expect(error).toHaveProperty("_tag", "EffectBusinessRuleError");
          expect(error).toHaveProperty("code", "DUPLICATE_CONTACT_TYPE");
          expect(error).toHaveProperty(
            "message",
            "Employee cannot have multiple contacts of type 'email'",
          );
        },
        onSuccess: () => {
          fail("Expected BusinessRuleError, but received success");
        },
      }),
      Effect.runSync,
    );
  });

  it("should fail to create employee with duplicate phone contacts (BusinessRuleError)", () => {
    const employeeWithDuplicatePhones = {
      id: employeeId1,
      name: "John Doe",
      role: RoleEnum.staff,
      info: "A valuable team member.",
      contacts: [
        { type: "phone" as const, value: "79001234567" },
        { type: "phone" as const, value: "79007654321" },
      ],
    };

    pipe(
      EmployeeEffect.createFromDTO(employeeWithDuplicatePhones),
      Effect.match({
        onFailure: (error) => {
          expect(error).toHaveProperty("_tag", "EffectBusinessRuleError");
          expect(error).toHaveProperty("code", "DUPLICATE_CONTACT_TYPE");
          expect(error).toHaveProperty(
            "message",
            "Employee cannot have multiple contacts of type 'phone'",
          );
        },
        onSuccess: () => {
          fail("Expected BusinessRuleError, but received success");
        },
      }),
      Effect.runSync,
    );
  });
});
