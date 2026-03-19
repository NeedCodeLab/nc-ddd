# nc-ddd: Интеграция с Effect

Библиотека `@need-code/nc-ddd` предоставляет утилиты для работы с Domain-Driven Design в TypeScript с поддержкой библиотеки **Effect** для функциональной обработки ошибок.

## Обзор

Эта документация описывает интеграцию nc-ddd с библиотекой **Effect**, включая:
- Создание Value Objects с использованием `Effect.Either`
- Построение сложных сущностей с валидацией всех полей
- Сбор и агрегацию ошибок валидации
- Работу с опциональными значениями

## Основные хелперы

### 1. `voEffectFactory`

Фабричная функция для создания Value Objects с возвратом `Either` из Effect.

**Импорт:**
```typescript
import { voEffectFactory } from '@need-code/nc-ddd';
```

**Сигнатура:**
```typescript
function voEffectFactory<S extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(
  value: unknown,
  schema: S,
  constructorFn: (props: v.InferOutput<S>) => VO<S>,
  key?: string,
): Either<Record<string, string[] | Record<string, string[]>>, VO<S>>
```

**Параметры:**
- `value` — значение для валидации
- `schema` — схема Valibot для валидации
- `constructorFn` — функция-конструктор VO (приватный конструктор)
- `key` — (опционально) ключ для группировки ошибок

**Возвращает:**
- `Right(VO)` — при успешной валидации
- `Left(Record<string, string[]>)` — при ошибках валидации

**Пример использования:**
```typescript
import * as v from "valibot";
import { VO } from "@need-code/nc-ddd";
import { voEffectFactory } from "@need-code/nc-ddd";

const IdVOSchema = v.pipe(
  v.string("Id must be a string"),
  v.trim(),
  v.nonEmpty("Id can't be empty"),
  v.uuid("Invalid Id"),
);

type IdVOProps = v.InferOutput<typeof IdVOSchema>;

export class IdVO extends VO<typeof IdVOSchema> {
  private constructor(props: IdVOProps) {
    super(props);
  }

  public static create = (val: v.InferInput<typeof IdVOSchema>, key?: string) => {
    return voEffectFactory(val, IdVOSchema, (props) => new IdVO(props), key);
  };
}

// Использование:
const result = IdVO.create("550e8400-e29b-41d4-a716-446655440000");
// Either<Record<string, string[]>, IdVO>
```

---

### Дополнительные проверки после базовой валидации

Для добавления кастомной бизнес-логики валидации **после** успешной проверки схемы Valibot используйте `Either.flatMap`:

**Импорт:**
```typescript
import { Either } from "effect";
import { left, right } from "effect/Either";
```

**Паттерн:**
```typescript
public static create = (val: v.InferInput<typeof Schema>, key?: string) => {
  return Either.flatMap(
    voEffectFactory(val, Schema, (props) => new MyVO(props), key),
    (vo) => {
      // Дополнительные проверки здесь
      if (vo.value.length > 20) {
        return left(["Слишком длинное значение (макс. 20 символов)"]);
      }
      return right(vo);
    }
  );
};
```

**Пример использования:**
```typescript
import * as v from "valibot";
import { VO } from "@need-code/nc-ddd";
import { voEffectFactory } from "@need-code/nc-ddd";
import { Either } from "effect";
import { left, right } from "effect/Either";

export const EmployeeNameVOSchema = v.pipe(
  v.string("Name must be a string"),
  v.trim(),
  v.nonEmpty("Name can't be empty"),
);

export type EmployeeNameVOProps = v.InferOutput<typeof EmployeeNameVOSchema>;

export class EmployeeNameVO extends VO<typeof EmployeeNameVOSchema> {
  private constructor(props: EmployeeNameVOProps) {
    super(props);
  }

  public static create = (val: v.InferInput<typeof EmployeeNameVOSchema>, key?: string) => {
    return Either.flatMap(
      voEffectFactory(val, EmployeeNameVOSchema, (props) => new EmployeeNameVO(props), key),
      (vo) => {
        // Дополнительная бизнес-валидация после проверки схемы
        if (vo.value.length > 20) {
          return left(["Имя слишком длинное (макс. 20 символов)"]);
        }
        return right(vo);
      }
    );
  };
}

// Использование:
const result = EmployeeNameVO.create("СлишкомДлинноеИмяДляСотрудника");
// Left: { value: ["Имя слишком длинное (макс. 20 символов)"] }

const result2 = EmployeeNameVO.create("John");
// Right: EmployeeNameVO
```

**Когда использовать:**
- Валидация сложных бизнес-правил, которые нельзя выразить через Valibot
- Проверки, зависящие от внешних данных или контекста
- Ограничения, специфичные для предметной области (например, максимальная длина, формат, уникальность)

---

### 2. `effectMapOptional`

Хелпер для работы с опциональными значениями (null | undefined) в контексте Effect.

**Импорт:**
```typescript
import { effectMapOptional } from '@need-code/nc-ddd';
```

**Сигнатура:**
```typescript
function effectMapOptional<V, L, R>(
  value: V,
  factory: (value: NonNullable<V>) => Either<L, R>
): Either<L, R | null | undefined>
```

**Параметры:**
- `value` — значение, которое может быть `null` или `undefined`
- `factory` — фабрика, создающая `Either` для не-null/undefined значений

**Возвращает:**
- `Right(null)` — если значение `null`
- `Right(undefined)` — если значение `undefined`
- `Right(R)` — если значение валидно и фабрика вернула `Right`
- `Left(L)` — если фабрика вернула `Left`

**Пример использования:**
```typescript
import { effectMapOptional } from '@need-code/nc-ddd';

// lastName может быть null
const lastNameResult = effectMapOptional(
  props.lastName,
  (v) => EmployeeLastNameVO.create(v)
);
// Возвращает: Either<..., EmployeeLastNameVO | null>
```

---

### 3. `extractEffectErrors`

Утилита для извлечения и нормализации ошибок из структуры `Cause` Effect.

**Импорт:**
```typescript
import { extractEffectErrors } from '@need-code/nc-ddd';
```

**Сигнатура:**
```typescript
function extractEffectErrors(input: Record<string, unknown>): Record<string, string[]>
```

**Параметры:**
- `input` — объект с ошибками в формате Effect (с `Option.Some`)

**Возвращает:**
- `Record<string, string[]>` — плоский объект с ошибками по полям

**Пример:**
```typescript
import { extractEffectErrors } from '@need-code/nc-ddd';

// На входе:
const cause = {
  name: Option.Some(["Name can't be empty"]),
  contacts: Option.Some([
    Option.Some({ "contacts.0": { value: ["Invalid email"] } })
  ])
};

// На выходе:
const errors = extractEffectErrors(cause);
// {
//   name: ["Name can't be empty"],
//   "contacts.0.value": ["Invalid email"]
// }
```

---

## Построение сущностей с Effect

### Паттерн создания Entity

Для создания сущностей с полной валидацией всех полей используйте `Effect.all` с режимом `validate`:

```typescript
import { Effect, pipe } from "effect";
import { effectMapOptional } from "@need-code/nc-ddd";
import { extractEffectErrors } from "@need-code/nc-ddd";

interface EmployeeProps {
  id: string;
  name: string;
  lastName: string | null;  // опциональное поле
  role: RoleEnum;
  info: string;
  contacts: Array<{ type: string; value: string }>;
}

function createEmployee(props: EmployeeProps) {
  return pipe(
    Effect.all(
      {
        // Валидация обязательных полей
        id: IdVO.create(props.id),
        name: EmployeeNameVO.create(props.name),
        role: EmployeeRoleVO.create(props.role),
        info: EmployeeInfoVO.create(props.info),
        
        // Валидация опционального поля
        lastName: effectMapOptional(
          props.lastName,
          (v) => EmployeeLastNameVO.create(v)
        ),
        
        // Валидация массива с сбором всех ошибок
        contacts: Effect.all(
          props.contacts.map((contact, i) => 
            EmployeeContactVO.create(contact, `contacts.${i}`)
          ),
          { mode: "validate" }
        ),
      },
      { mode: "validate" }  // Сбор ВСЕХ ошибок, а не остановка на первой
    ),
    // Преобразование ошибок в плоский формат
    Effect.mapError((cause) => extractEffectErrors(cause)),
    // Создание сущности из валидных данных
    Effect.map((data) =>
      EmployeeEffect.create({
        id: data.id,
        name: data.name,
        info: data.info,
        role: data.role,
        contacts: data.contacts,
        lastName: data.lastName ?? null,
      })
    ),
    // Преобразование в Either для синхронного выполнения
    Effect.either,
    Effect.runSync,
  );
}
```

---

## Режимы работы Effect.all

### `mode: "validate"` (рекомендуется для DDD)

Собирает **все ошибки** валидации, а не останавливается на первой.

```typescript
Effect.all(
  {
    field1: validateField1(value1),
    field2: validateField2(value2),
    field3: validateField3(value3),
  },
  { mode: "validate" }
)
// Если все 3 поля невалидны — вернёт ошибки для всех 3 полей
```

### `mode: "failFast"` (по умолчанию)

Останавливается на первой ошибке.

```typescript
Effect.all({
  field1: validateField1(value1),
  field2: validateField2(value2),
})
// Если field1 невалиден — field2 даже не будет проверен
```

---

## Работа с массивами Value Objects

Для валидации массивов VO используйте `Effect.all` с `mode: "validate"`:

```typescript
contacts: Effect.all(
  props.contacts.map((contact, index) => 
    EmployeeContactVO.create(contact, `contacts.${index}`)
  ),
  { mode: "validate" }
)
```

**Ключи для ошибок:**
- Передавайте `key` параметр в `voEffectFactory` для правильной идентификации поля
- Формат: `contacts.0.value`, `contacts.1.type`, и т.д.

---

## Полный пример: Aggregate Root с Effect

```typescript
import { Effect, pipe } from "effect";
import { voEffectFactory } from "@need-code/nc-ddd";
import { extractEffectErrors } from "@need-code/nc-ddd";
import { AggregateRoot } from "@need-code/nc-ddd";

interface CompanyProps {
  id: string;
  companyName: string;
  employees: Array<EmployeeData>;
}

export class Company extends AggregateRoot<CompanyProps> {
  private constructor(props: CompanyProps) {
    super(props);
  }

  public static create(rawDTO: unknown) {
    return pipe(
      // Шаг 1: Валидация DTO
      Effect.try({
        try: () => safeParse(CreateCompanyDTOSchema, rawDTO),
        catch: (e) => ({ parse: [String(e)] })
      }),
      Effect.filterOrFail(
        (result) => result.success,
        (result) => ({ dto: flatten(result.issues).nested })
      ),
      // Шаг 2: Валидация всех полей
      Effect.flatMap((dtoResult) =>
        Effect.all(
          {
            id: IdVO.create(dtoResult.output.id),
            companyName: CompanyNameVO.create(dtoResult.output.companyName),
            employees: Effect.all(
              dtoResult.output.employees.map((e: any) => Employee.create(e)),
              { mode: "validate" }
            ),
          },
          { mode: "validate" }
        )
      ),
      // Шаг 3: Преобразование ошибок
      Effect.mapError((cause) => extractEffectErrors(cause)),
      // Шаг 4: Создание агрегата
      Effect.map(([id, companyName, employees]) =>
        new Company({ id, companyName, employees })
      ),
      Effect.either,
      Effect.runSync
    );
  }
}
```

---

## Обработка результатов

### Проверка результата

```typescript
import { Either } from "effect";

const result = createEmployee(employeeData);

if (Either.isRight(result)) {
  const employee = result.right;
  console.log(employee.primitive);
}

if (Either.isLeft(result)) {
  const errors = result.left;
  console.error(errors);
  // { name: ["Name can't be empty"], info: ["Info must be a string"] }
}
```

### Паттерн map/mapLeft

```typescript
import { Either } from "effect";

pipe(
  result,
  Either.map((employee) => {
    // Успешное создание
    console.log("Employee created:", employee.primitive);
  }),
  Either.mapLeft((errors) => {
    // Ошибки валидации
    console.error("Validation failed:", errors);
  })
);
```

---

## Типовые сценарии использования

### 1. Валидация простого VO

```typescript
const nameResult = EmployeeNameVO.create("John");
// Either<{ value: string[] }, EmployeeNameVO>
```

### 2. Валидация с кастомным ключом

```typescript
const idResult = IdVO.create("invalid-uuid", "userId");
// Left: { userId: ["Invalid Id"] }
```

### 3. Валидация опционального поля

```typescript
const lastNameResult = effectMapOptional(
  maybeLastName,
  (v) => EmployeeLastNameVO.create(v)
);
// Either<..., EmployeeLastNameVO | null | undefined>
```

### 4. Валидация массива со сбором всех ошибок

```typescript
const contactsResult = Effect.all(
  [
    EmployeeContactVO.create({ type: "email", value: "invalid" }, "contacts.0"),
    EmployeeContactVO.create({ type: "email", value: "valid@email.com" }, "contacts.1"),
    EmployeeContactVO.create({ type: "phone", value: "79991234567" }, "contacts.2"),
  ],
  { mode: "validate" }
);
// Соберёт ошибку только для contacts.0, но проверит все элементы
```

### 5. Комплексная валидация сущности

```typescript
const employeeResult = pipe(
  Effect.all({
    id: IdVO.create(id),
    name: EmployeeNameVO.create(name),
    lastName: effectMapOptional(lastName, EmployeeLastNameVO.create),
    role: EmployeeRoleVO.create(role),
    contacts: Effect.all(
      contacts.map((c, i) => EmployeeContactVO.create(c, `contacts.${i}`)),
      { mode: "validate" }
    ),
  }, { mode: "validate" }),
  Effect.mapError(extractEffectErrors),
  Effect.map(EmployeeEffect.create),
  Effect.either,
  Effect.runSync
);
```

---

## Сравнение: @sweet-monads/either vs Effect

| Характеристика | @sweet-monads/either | Effect |
|---------------|---------------------|--------|
| Сбор всех ошибок | Ручная реализация через `merge` | Встроенный `mode: "validate"` |
| Работа с массивами | `merge(array.map(...))` | `Effect.all(array, { mode: "validate" })` |
| Опциональные значения | Ручная проверка | `effectMapOptional` |
| Композиция | Цепочки `flatMap` | `pipe` + `Effect.all` |
| Логирование | Ручное | Встроенное через `Effect.tap` |

**Рекомендация:** Используйте **Effect** для сложных сценариев с множеством полей и необходимостью сбора всех ошибок валидации.

---

## Peer зависимости

Для работы с Effect убедитесь, что установлены:

```json
{
  "peerDependencies": {
    "effect": "^3.20.0",
    "valibot": ">=1.0.0"
  }
}
```

```bash
npm install effect valibot
```

---

## API Reference

### Экспорт из пакета

```typescript
export {
  // Хелперы для Effect
  voEffectFactory,        // Фабрика VO с Either
  effectMapOptional,      // Работа с null/undefined
  extractEffectErrors,    // Извлечение ошибок из Cause
  
  // Базовые классы
  VO,                     // Value Object
  Entity,                 // Entity
  AggregateRoot,          // Aggregate Root
} from '@need-code/nc-ddd';
```

### Типы

```typescript
// Возвращаемый тип voEffectFactory
type VOResult<S extends v.BaseSchema> = Either<
  Record<string, string[] | Record<string, string[]>>,
  VO<S>
>;

// Тип effectMapOptional
type OptionalResult<L, R> = Either<L, R | null | undefined>;
```

---

## Отладка

### Логирование промежуточных результатов

```typescript
pipe(
  Effect.all({...}, { mode: "validate" }),
  Effect.tap((data) => Effect.log("Validated data:", data)),
  Effect.mapError((cause) => {
    Effect.log("Errors:", cause);
    return extractEffectErrors(cause);
  }),
  // ...
)
```

### Инспекция ошибок

```typescript
const result = createEntity(invalidProps);

if (Either.isLeft(result)) {
  console.log("Errors:", JSON.stringify(result.left, null, 2));
  // {
  //   "name": ["Name can't be empty"],
  //   "contacts.1.value": ["Invalid email"]
  // }
}
```
