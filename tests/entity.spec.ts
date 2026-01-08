import { randomUUID } from "node:crypto";
import { EmployeeEntity } from "../example/entities/employee.entity";
import { RoleEnum } from "../example/value-objects/employee/employee-role.vo";

describe("Entity class tests", () => {
  it("should return errors for invalid DTO", () => {
    const eitherEntity = EmployeeEntity.create({
      id: randomUUID(),
      name: "Alex",
      info: "", // Invalid info
      contacts: [
        { type: "email", value: "mailemail.com" }, // Invalid email
        { type: "email", value: "maile@mail.com" }, // Valid email
        { type: "email", value: "mailemail.com" }, // Invalid email
      ],
      role: RoleEnum.admin,
    });

    eitherEntity.fold(
      (errors) => {
        expect(errors).toEqual({
          info: ["Info can`t be empty"],
          contacts: {
            "0": {
              value: ["Invalid email"],
            },
            "2": {
              value: ["Invalid email"],
            },
          },
        });
      },
      () => {
        fail("Expected a Left, but received a Right");
      },
    );
  });

  it("should create a valid EmployeeEntity", () => {
    const eitherEntity = EmployeeEntity.create({
      id: randomUUID(),
      name: "Alex",
      info: "Some info",
      contacts: [
        { type: "email", value: "maile@mail.com" },
        { type: "phone", value: "79222222222" },
      ],
      role: RoleEnum.staff,
    });

    eitherEntity.fold(
      (errors) => {
        fail(`Expected a Right, but received a Left with errors: ${JSON.stringify(errors)}`);
      },
      (employee) => {
        expect(employee).toBeInstanceOf(EmployeeEntity);
        expect(employee.primitive.name).toBe("Alex");
        expect(employee.primitive.info).toBe("Some info");
        expect(employee.primitive.contacts).toEqual([
          { type: "email", value: "maile@mail.com" },
          { type: "phone", value: "79222222222" },
        ]);
        expect(employee.primitive.role).toBe(RoleEnum.staff);
      },
    );
  });
  it("should update EmployeeEntity", () => {
    const eitherEntity = EmployeeEntity.create({
      id: randomUUID(),
      name: "Alex",
      info: "Some info",
      contacts: [
        { type: "email", value: "maile@mail.com" },
        { type: "phone", value: "79222222222" },
      ],
      role: RoleEnum.staff,
    });
    eitherEntity.mapLeft(() => {
      throw new Error("Expected a Right, but received a Left");
    });
    eitherEntity
      .chain((employee) => {
        return employee.update({ name: "Bob" });
      })
      .fold(
        () => {
          throw new Error("Expected a Right, but received a Left");
        },
        (updated) => {
          expect(updated).toBeInstanceOf(EmployeeEntity);
          expect(updated.primitive.name).toBe("Bob");
        },
      );
  });
  it("should not update EmployeeEntity", () => {
    const eitherEntity = EmployeeEntity.create({
      id: randomUUID(),
      name: "Alex",
      info: "Some info",
      contacts: [
        { type: "email", value: "maile@mail.com" },
        { type: "phone", value: "79222222222" },
      ],
      role: RoleEnum.staff,
    });
    eitherEntity.mapLeft(() => {
      throw new Error("Expected a Right, but received a Left");
    });
    eitherEntity
      .chain((employee) => {
        return employee.update({ name: "" });
      })
      .fold(
        (e) => {
          expect(e).toEqual({
            name: ["Name can`t be empty"],
          });
        },
        () => {
          throw new Error("Expected a Left, but received a Right");
        },
      );
  });
});
