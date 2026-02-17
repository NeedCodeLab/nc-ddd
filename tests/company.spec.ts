import { randomUUID } from "node:crypto";
import { merge } from "@sweet-monads/either";
import { Company } from "../example/aggregates/company.aggregate";
import { RoleEnum } from "../example/value-objects/employee/employee-role.vo";

describe("Company Aggregate", () => {
  const companyId1 = randomUUID();
  const companyId2 = randomUUID();
  const employeeId1 = randomUUID();

  const validEmployee = {
    id: employeeId1,
    name: "John Doe",
    lastName: null,
    role: RoleEnum.staff,
    info: "A valuable team member.",
    contacts: [{ type: "email" as const, value: "john.doe@example.com" }],
  };

  const validCompanyDTO = {
    id: companyId1,
    companyName: "TestCo",
    employees: [validEmployee],
  };

  it("should create a company aggregate with valid properties", () => {
    const companyEither = Company.create(validCompanyDTO);

    companyEither.fold(
      (error) => {
        console.error("Test Error:", error);
        fail("Should have created a company, but failed.");
      },
      (company) => {
        expect(company).toBeInstanceOf(Company);
        expect(company.id.value).toBe(companyId1);
        expect(company.props.companyName.value).toBe("TestCo");
        expect(company.props.employees.length).toBe(1);
        const firstEmployee = company.props.employees[0];
        expect(firstEmployee).toBeDefined();
        if (firstEmployee) {
          expect(firstEmployee.id.value).toBe(employeeId1);
        }
      },
    );
  });

  it("should fail if companyName is invalid", () => {
    const invalidCompanyDTO = {
      ...validCompanyDTO,
      companyName: "",
    };

    const companyEither = Company.create(invalidCompanyDTO);

    companyEither.fold(
      (errors) => {
        expect(errors).toEqual({
          companyName: ["Name can`t be empty"],
        });
      },
      () => fail("Should have failed, but created a company."),
    );
  });

  it("should fail if an employee is invalid", () => {
    const invalidCompanyDTO = {
      ...validCompanyDTO,
      employees: [
        {
          ...validEmployee,
          name: "",
        },
      ],
    };

    const companyEither = Company.create(invalidCompanyDTO);

    companyEither.fold(
      (errors) => {
        expect(errors).toEqual({
          "employees.0": { name: ["Name can`t be empty"] },
        });
      },
      () => fail("Should have failed, but created a company."),
    );
  });

  it("should fail with multiple invalid employees, returning the first error", () => {
    const invalidEmployee2 = {
      ...validEmployee,
      id: randomUUID(),
      name: "", // invalid name
    };

    const invalidEmployee3 = {
      ...validEmployee,
      id: randomUUID(),
      role: "invalid-role" as any, // invalid role
    };

    const invalidCompanyDTO = {
      ...validCompanyDTO,
      employees: [validEmployee, invalidEmployee2, invalidEmployee3],
    };

    const companyEither = Company.create(invalidCompanyDTO);

    companyEither.fold(
      (errors) => {
        expect(errors).toEqual({
          "employees.1": { name: ["Name can`t be empty"] },
        });
      },
      () => fail("Should have failed, but created a company."),
    );
  });

  it("should fail if an employee has an invalid contact", () => {
    const invalidCompanyDTO = {
      ...validCompanyDTO,
      employees: [
        {
          ...validEmployee,
          contacts: [{ type: "email" as const, value: "invalid-email" }],
        },
      ],
    };

    const companyEither = Company.create(invalidCompanyDTO);

    companyEither.fold(
      (errors) => {
        expect(errors).toEqual({
          "employees.0": { "contacts.0": { value: ["Invalid email"] } },
        });
      },
      () => fail("Should have failed, but created a company."),
    );
  });

  it("should fail if the company id is invalid", () => {
    const invalidCompanyDTO = {
      ...validCompanyDTO,
      id: "not-a-valid-uuid",
    };

    const companyEither = Company.create(invalidCompanyDTO);

    companyEither.fold(
      (errors) => {
        expect(errors).toEqual({
          id: ["Invalid Id"],
        });
      },
      () => fail("Should have failed, but created a company."),
    );
  });

  it("should return correct primitive values", () => {
    const companyEither = Company.create(validCompanyDTO);
    companyEither.fold(
      () => {
        throw new Error("Should have created companies, but failed.");
      },
      (company) => {
        const primitive = company.primitive;
        expect(primitive).toEqual({
          id: companyId1,
          companyName: "TestCo",
          employees: [
            {
              id: employeeId1,
              name: "John Doe",
              lastName: null,
              role: "staff",
              info: "A valuable team member.",
              contacts: [{ type: "email", value: "john.doe@example.com" }],
            },
          ],
        });
      },
    );
  });

  it("should be equal to another aggregate with the same ID", () => {
    const company1Either = Company.create(validCompanyDTO);
    const company2Either = Company.create({ ...validCompanyDTO, companyName: "AnotherName" });

    merge([company1Either, company2Either]).fold(
      () => fail("Should have created companies, but failed."),
      ([company1, company2]) => {
        expect(company1.isEqual(company2)).toBe(true);
      },
    );
  });

  it("should not be equal to another aggregate with a different ID", () => {
    const company1Either = Company.create(validCompanyDTO);
    const company2Either = Company.create({ ...validCompanyDTO, id: companyId2 });

    merge([company1Either, company2Either]).fold(
      () => fail("Should have created companies, but failed."),
      ([company1, company2]) => {
        expect(company1.isEqual(company2)).toBe(false);
      },
    );
  });
});
