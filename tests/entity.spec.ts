import { EmployeeEntity } from "../example/entities/employee.entity";
import { RoleEnum } from "../example/value-objects/employee/employee-role.vo";

describe("Entity class tests", () => {
  it("should return errors for invalid DTO", () => {
    const eitherVO = EmployeeEntity.create({
      name: "Alex",
      info: "", // Invalid info
      contacts: [
        { type: "email", value: "mailemail.com" }, // Invalid email
        { type: "email", value: "maile@mail.com" }, // Valid email
        { type: "email", value: "mailemail.com" }, // Invalid email
      ],
      role: RoleEnum.admin,
    });

    eitherVO.fold(
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
    const eitherVO = EmployeeEntity.create({
      name: "Alex",
      info: "Some info",
      contacts: [
        { type: "email", value: "maile@mail.com" },
        { type: "phone", value: "79222222222" },
      ],
      role: RoleEnum.staff,
    });

    eitherVO.fold(
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
});
