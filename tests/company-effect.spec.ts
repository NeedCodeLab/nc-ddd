import { randomUUID } from "node:crypto";
import { Effect, pipe } from "effect/index";
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
          expect(error).toEqual({
            companyName: ["Company name cannot be empty"],
            "employees.1.contacts.0.value": ["Invalid email format"],
            "employees.0.name": ["Name cannot be empty"],
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
          expect(error).toEqual({
            "employees.0.contacts.0.value": ["Invalid email format"],
          });
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
});
