# nc-ddd

A set of base classes for implementing Domain-Driven Design patterns in TypeScript.

This library provides base classes for Value Objects, Entities, and Aggregate Roots, helping you to structure your domain logic in a clean and maintainable way. It uses `valibot` for validation and `@sweet-monads/either` for handling success and failure cases in a functional way.

## Installation

Install the package and its peer dependencies using your favorite package manager:

```bash
npm install nc-ddd @sweet-monads/either valibot
```

## Core Concepts

### Value Object (VO)

A Value Object is an object that represents a descriptive aspect of the domain with no conceptual identity. VOs are immutable and are compared by their values.

The `VO` base class provides:
- A private constructor to enforce creation through a factory method.
- An `isEqual` method for structural comparison.
- A `value` getter to access the primitive value.

**Example: `CompanyNameVO`**

```typescript
// example/value-objects/company/company-name.vo.ts
import * as v from "valibot";
import { VO } from "@/core/vo";
import { voFactory } from "@/helpers/vo-factory";

export const CompanyNameVOSchema = v.pipe(
  v.string("Name must be a string"),
  v.trim(),
  v.nonEmpty("Name can`t be empty"),
);

export type CompanyNameVOProps = v.InferOutput<typeof CompanyNameVOSchema>;

export class CompanyNameVO extends VO<typeof CompanyNameVOSchema> {
  private constructor(props: CompanyNameVOProps) {
    super(props);
  }
  public static create = (val: v.InferInput<typeof CompanyNameVOSchema>) => {
    return voFactory(val, CompanyNameVOSchema, (props) => new CompanyNameVO(props));
  };
}
```

### Entity

An Entity is an object with a unique identity that persists over time. Entities are mutable and are compared by their identity.

The `Entity` base class provides:
- A protected constructor to enforce creation through factory methods.
- An `id` getter for easy access to the entity's identifier.
- An `isEqual` method that compares entities based on their ID.
- A `primitive` getter to get the primitive values of the entity's props.

**Example: `Employee` Entity**

```typescript
// example/entities/employee.entity.ts
import { left, merge } from "@sweet-monads/either";
import { flatten, safeParse } from "valibot";
import { Entity } from "@/core/entity";
import { CreateEmployeeDTOSchema } from "../dtos/create-employee.dto";
import { EmployeeContactVO } from "../value-objects/employee/employee-contact.vo";
import { EmployeeInfoVO } from "../value-objects/employee/employee-info.vo";
import { EmployeeNameVO } from "../value-objects/employee/employee-name.vo";
import { EmployeeRoleVO } from "../value-objects/employee/employee-role.vo";
import { IdVO } from "../value-objects/id.vo";

export interface EmployeeProps {
  id: IdVO;
  name: EmployeeNameVO;
  role: EmployeeRoleVO;
  info: EmployeeInfoVO;
  contacts: EmployeeContactVO[];
}

export class Employee extends Entity<EmployeeProps> {
  private constructor(props: EmployeeProps) {
    super(props);
  }

  public static create(rawDTO: unknown) {
    const dtoResult = safeParse(CreateEmployeeDTOSchema, rawDTO);

    if (!dtoResult.success) {
      return left(flatten(dtoResult.issues).nested);
    }

    const props = dtoResult.output;

    const id = IdVO.create(props.id);
    const name = EmployeeNameVO.create(props.name);
    const role = EmployeeRoleVO.create(props.role);
    const info = EmployeeInfoVO.create(props.info);
    const contacts = merge(props.contacts.map((c) => EmployeeContactVO.create(c)));

    return merge([id, name, role, info, contacts]).map(([id, name, role, info, contacts]) => {
      return new Employee({ id, name, role, info, contacts });
    });
  }
}
```

### Aggregate Root

An Aggregate Root is a specific type of Entity that acts as a gateway to a cluster of associated objects.

The `AgregateRoot` base class extends the `Entity` class and allows for more complex properties, including other Entities.

**Example: `Company` Aggregate Root**
```typescript
// example/aggregates/company.aggregate.ts
import { left, merge } from "@sweet-monads/either";
import { flatten, safeParse } from "valibot";

import { AgregateRoot } from "@/core/agregate-root";
import { CreateCompanyDTOSchema } from "../dtos/create-company.dto";
import { Employee } from "../entities/employee.entity";
import { CompanyNameVO } from "../value-objects/company/company-name.vo";
import { IdVO } from "../value-objects/id.vo";

export interface CompanyProps {
  id: IdVO;
  companyName: CompanyNameVO;
  employees: Employee[];
}

export class Company extends AgregateRoot<CompanyProps> {
  private constructor(props: CompanyProps) {
    super(props);
  }

  public static create(rawDTO: unknown) {
    const dtoResult = safeParse(CreateCompanyDTOSchema, rawDTO);

    if (!dtoResult.success) {
      return left(flatten(dtoResult.issues).nested);
    }

    const props = dtoResult.output;

    const id = IdVO.create(props.id);
    const companyName = CompanyNameVO.create(props.companyName);
    const employees = merge(props.employees.map((e) => Employee.create(e)));

    return merge([id, companyName, employees]).map(([id, companyName, employees]) => {
      return new Company({ id, companyName, employees });
    });
  }
}
```

## Usage

The `voFactory` helper and the static `create` methods on VOs, Entities, and Aggregate Roots return an `Either` monad from `@sweet-monads/either`. This allows you to handle successful creation and validation errors in a functional and type-safe way.

```typescript
import { Company } from "./example/aggregates/company.aggregate";

const companyData = {
  id: "d1a6b1b1-3b3b-4b3b-8b3b-1b1b1b1b1b1b",
  companyName: "NeedCode",
  employees: [
    {
      id: "a1a1a1a1-1a1a-1a1a-1a1a-1a1a1a1a1a1a",
      name: "John Doe",
      role: "admin",
      info: "Lead developer",
      contacts: [
        { type: "email", value: "john.doe@example.com" },
        { type: "phone", value: "71234567890" },
      ],
    },
  ],
};

const companyResult = Company.create(companyData);

companyResult.map((company) => {
  console.log("Company created successfully:", company.primitive);
});

companyResult.mapLeft((errors) => {
  console.error("Failed to create company:", errors);
});
```

## Running Tests

To run the tests, use the following command:

```bash
npm test
```