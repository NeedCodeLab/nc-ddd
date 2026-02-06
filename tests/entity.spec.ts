import { randomUUID } from "node:crypto";
import { merge } from "@sweet-monads/either";
import { Employee } from "../example/entities/employee.entity";
import { RoleEnum } from "../example/value-objects/employee/employee-role.vo";

describe("Entity implementation tests", () => {
  const employeeId1 = randomUUID();
  const employeeId2 = randomUUID();

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
    info: 1,
    contacts: [{ type: "email" as const, value: "john.doeexample.com" }],
  };
  it("should throw error an entity with invalid properties", () => {
    const employeeEither = Employee.create(invalidEmployeeProps);

    employeeEither.fold(
      (error) => {
        expect(error).toEqual({
          name: ["Name can`t be empty"],
          info: ["Info must be a string"],
          "contacts.0": { value: ["Invalid email"] },
        });
      },
      () => {
        throw new Error("Expected a Right, but received a Left");
      },
    );
  });
  it("should create an entity with valid properties", () => {
    const employeeEither = Employee.create(validEmployeeProps);

    employeeEither.fold(
      (error) => {
        console.error(error);
        fail("Expected a Right, but received a Left");
      },
      (employee) => {
        expect(employee.primitive).toEqual({
          id: employeeId1,
          name: "John Doe",
          role: "staff",
          info: "A valuable team member.",
          contacts: [{ type: "email", value: "john.doe@example.com" }],
          lastName: null,
        });
      },
    );
  });

  it("should fail to create an entity with invalid id", () => {
    const invalidEmployeeProps = {
      ...validEmployeeProps,
      id: "not-a-uuid",
    };

    const employeeEither = Employee.create(invalidEmployeeProps);

    employeeEither.fold(
      (errors) => {
        expect(errors).toEqual({
          id: ["Invalid Id"],
        });
      },
      () => fail("Expected a Left, but received a Right"),
    );
  });

  it("should fail to create an entity with invalid contact", () => {
    const invalidEmployeeProps = {
      ...validEmployeeProps,
      contacts: [{ type: "email" as const, value: "invalid-email" }],
    };

    const employeeEither = Employee.create(invalidEmployeeProps);

    employeeEither.fold(
      (errors) => {
        expect(errors).toEqual({
          "contacts.0": { value: ["Invalid email"] },
        });
      },
      () => fail("Expected a Left, but received a Right"),
    );
  });

  it("should consider two entities with the same ID as equal", () => {
    const employee1Either = Employee.create(validEmployeeProps);
    const employee2Either = Employee.create({
      ...validEmployeeProps,
      name: "Jane Doe",
    });
    merge([employee1Either, employee2Either]).fold(
      () => {
        throw new Error("Entity creation failed");
      },
      ([e1, e2]) => {
        expect(e1.isEqual(e2)).toBe(true);
      },
    );
  });

  it("should not consider two entities with different IDs as equal", () => {
    const employee1Either = Employee.create(validEmployeeProps);
    const employee2Either = Employee.create({
      ...validEmployeeProps,
      id: employeeId2,
    });
    merge([employee1Either, employee2Either]).fold(
      () => {
        throw new Error("Entity creation failed");
      },
      ([e1, e2]) => {
        expect(e1.isEqual(e2)).toBe(false);
      },
    );
  });
});
