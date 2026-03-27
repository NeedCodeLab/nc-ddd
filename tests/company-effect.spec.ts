import { randomUUID } from "node:crypto";
import { Effect, pipe } from "effect/index";
import type { EffectBusinessRuleError } from "@/errors/business-rule.error";
import type { EffectValidationError } from "@/errors/validation.error";
import { CompanyEffect } from "../examples/effect/aggregates/company.effect-aggregate";
import { RoleEnum } from "../examples/effect/value-objects/employee/employee-role.vo";

describe("Company Aggregate implementation tests", () => {
  const companyId = randomUUID();
  const employeeId1 = randomUUID();
  const employeeId2 = randomUUID();

  const validCompanyDTO = {
    id: companyId,
    companyName: "Acme Corporation",
    employees: [
      {
        id: employeeId1,
        name: "John Doe",
        role: RoleEnum.staff,
        info: "A valuable team member.",
        contacts: [{ type: "email" as const, value: "john.doe@example.com" }],
      },
      {
        id: employeeId2,
        name: "Jane Smith",
        role: RoleEnum.admin,
        info: "Team lead.",
        contacts: [{ type: "email" as const, value: "jane.smith@example.com" }],
      },
    ],
  };

  const invalidCompanyDTO = {
    id: companyId,
    companyName: "",
    employees: [
      {
        id: employeeId1,
        name: "",
        role: RoleEnum.staff,
        info: "asd",
        contacts: [{ type: "email" as const, value: "valid@email.ru" }],
      },
      {
        id: employeeId1,
        name: "Tom",
        role: RoleEnum.staff,
        info: "asd",
        contacts: [{ type: "email" as const, value: "invalid-email.ru" }],
      },
    ],
  };

  const invalidEmployeeInCompanyDTO = {
    id: companyId,
    companyName: "Acme Corporation",
    employees: [
      {
        id: employeeId1,
        name: "John Doe",
        role: RoleEnum.staff,
        info: "Valid info",
        contacts: [{ type: "email" as const, value: "invalid-email" }],
      },
    ],
  };

  it("should create company aggregate with valid properties", () => {
    pipe(
      CompanyEffect.createFromDTO(validCompanyDTO),
      Effect.match({
        onFailure: () => {
          fail("Expected success, but received an error");
        },
        onSuccess: (company) => {
          expect(company.primitive).toEqual({
            id: companyId,
            companyName: "Acme Corporation",
            employees: [
              {
                id: employeeId1,
                name: "John Doe",
                role: "staff",
                info: "A valuable team member.",
                contacts: [{ type: "email", value: "john.doe@example.com" }],
                lastName: null,
              },
              {
                id: employeeId2,
                name: "Jane Smith",
                role: "admin",
                info: "Team lead.",
                contacts: [{ type: "email", value: "jane.smith@example.com" }],
                lastName: null,
              },
            ],
          });
        },
      }),
      Effect.runSync,
    );
  });

  it("should fail to create company with invalid company name", () => {
    pipe(
      CompanyEffect.createFromDTO(invalidCompanyDTO),
      Effect.match({
        onFailure: (error) => {
          expect(error._tag === "EffectValidationError").toBeTruthy();
          const e = error as EffectValidationError;
          expect(e.errors).toEqual({
            companyName: ["Company name cannot be empty"],
            "employees.0.name": ["Name cannot be empty"],
            "employees.1.contacts.0": ["Invalid email format"],
          });
        },
        onSuccess: () => {
          fail("Expected an error, but received success");
        },
      }),
      Effect.runSync,
    );
  });

  it("should fail to create company with invalid employee data", () => {
    pipe(
      CompanyEffect.createFromDTO(invalidEmployeeInCompanyDTO),
      Effect.match({
        onFailure: (error) => {
          expect(error._tag === "EffectValidationError").toBeTruthy();
          const e = error as EffectValidationError;
          expect(e.errors).toEqual({ "employees.0.contacts.0": ["Invalid email format"] });
        },
        onSuccess: () => {
          fail("Expected an error, but received success");
        },
      }),
      Effect.runSync,
    );
  });

  it("should create company with empty employees array", () => {
    pipe(
      CompanyEffect.createFromDTO({
        id: companyId,
        companyName: "Solo Company",
        employees: [],
      }),
      Effect.match({
        onFailure: () => {
          fail("Expected success, but received an error");
        },
        onSuccess: (company) => {
          expect(company.primitive.companyName).toBe("Solo Company");
          expect(company.primitive.employees).toEqual([]);
        },
      }),
      Effect.runSync,
    );
  });

  it("should create company with exactly 3 employees (max allowed)", () => {
    const employeeId3 = randomUUID();
    const companyWithMaxEmployees = {
      id: companyId,
      companyName: "Max Employees Corp",
      employees: [
        {
          id: employeeId1,
          name: "Employee One",
          role: RoleEnum.staff,
          info: "First employee",
          contacts: [{ type: "email" as const, value: "one@example.com" }],
        },
        {
          id: employeeId2,
          name: "Employee Two",
          role: RoleEnum.staff,
          info: "Second employee",
          contacts: [{ type: "email" as const, value: "two@example.com" }],
        },
        {
          id: employeeId3,
          name: "Employee Three",
          role: RoleEnum.staff,
          info: "Third employee",
          contacts: [{ type: "email" as const, value: "three@example.com" }],
        },
      ],
    };

    pipe(
      CompanyEffect.createFromDTO(companyWithMaxEmployees),
      Effect.match({
        onFailure: () => {
          fail("Expected success, but received an error");
        },
        onSuccess: (company) => {
          expect(company.primitive.employees.length).toBe(3);
        },
      }),
      Effect.runSync,
    );
  });

  it("should fail to create company with more than 3 employees (EffectBusinessRuleError)", () => {
    const employeeId3 = randomUUID();
    const employeeId4 = randomUUID();
    const companyWithTooManyEmployees = {
      id: companyId,
      companyName: "Too Many Employees Corp",
      employees: [
        {
          id: employeeId1,
          name: "Employee One",
          role: RoleEnum.staff,
          info: "First employee",
          contacts: [{ type: "email" as const, value: "one@example.com" }],
        },
        {
          id: employeeId2,
          name: "Employee Two",
          role: RoleEnum.staff,
          info: "Second employee",
          contacts: [{ type: "email" as const, value: "two@example.com" }],
        },
        {
          id: employeeId3,
          name: "Employee Three",
          role: RoleEnum.staff,
          info: "Third employee",
          contacts: [{ type: "email" as const, value: "three@example.com" }],
        },
        {
          id: employeeId4,
          name: "Employee Four",
          role: RoleEnum.staff,
          info: "Fourth employee",
          contacts: [{ type: "email" as const, value: "four@example.com" }],
        },
      ],
    };

    pipe(
      CompanyEffect.createFromDTO(companyWithTooManyEmployees),
      Effect.match({
        onFailure: (error) => {
          expect(error).toHaveProperty("_tag", "EffectBusinessRuleError");
          expect(error).toHaveProperty("code", "MAX_EMPLOYEES_EXCEEDED");
          expect(error).toHaveProperty(
            "message",
            "Cannot create company with 4 employees. Maximum allowed is 3",
          );
        },
        onSuccess: () => {
          fail("Expected EffectBusinessRuleError, but received success");
        },
      }),
      Effect.runSync,
    );
  });

  it("should fail to create company with 5 employees with correct error message", () => {
    const extraEmployeeIds = [randomUUID(), randomUUID(), randomUUID(), randomUUID(), randomUUID()];
    const companyWithFiveEmployees = {
      id: companyId,
      companyName: "Five Employees Corp",
      employees: extraEmployeeIds.map((id, idx) => ({
        id,
        name: `Employee ${idx + 1}`,
        role: RoleEnum.staff as const,
        info: `Employee info ${idx + 1}`,
        contacts: [{ type: "email" as const, value: `emp${idx + 1}@example.com` }],
      })),
    };

    pipe(
      CompanyEffect.createFromDTO(companyWithFiveEmployees),
      Effect.match({
        onFailure: (error) => {
          expect(error).toHaveProperty("_tag", "EffectBusinessRuleError");
          expect(error).toHaveProperty("code", "MAX_EMPLOYEES_EXCEEDED");
          expect(error).toHaveProperty(
            "message",
            "Cannot create company with 5 employees. Maximum allowed is 3",
          );
        },
        onSuccess: () => {
          fail("Expected EffectBusinessRuleError, but received success");
        },
      }),
      Effect.runSync,
    );
  });

  it("should fail to create company with employee having duplicate contact types (BusinessRuleError)", () => {
    const companyWithDuplicateContacts = {
      id: companyId,
      companyName: "Duplicate Contacts Corp",
      employees: [
        {
          id: employeeId1,
          name: "John Doe",
          role: RoleEnum.staff,
          info: "A valuable team member.",
          contacts: [
            { type: "email" as const, value: "john@example.com" },
            { type: "email" as const, value: "j.doe@example.com" },
          ],
        },
      ],
    };

    pipe(
      CompanyEffect.createFromDTO(companyWithDuplicateContacts),
      Effect.match({
        onFailure: (error) => {
          expect(error._tag === "EffectBusinessRuleError").toBeTruthy();
          const e = error as EffectBusinessRuleError;
          expect(e.message).toEqual("Employee cannot have multiple contacts of type 'email'");
        },
        onSuccess: () => {
          fail("Expected error, but received success");
        },
      }),
      Effect.runSync,
    );
  });
});
