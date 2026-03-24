import { randomUUID } from "node:crypto";
import { Effect, pipe } from "effect/index";
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
      Effect.match({
        onFailure: (error) => {
          expect(error).toEqual({
            name: ["Name cannot be empty"],
            info: ["Info must be a string"],
            "contacts.0.value": ["Invalid email format"],
          });
        },
        onSuccess: () => {
          fail("Expected a Right, but received a Left");
        },
      }),
      Effect.runSync,
    );
  });
});
