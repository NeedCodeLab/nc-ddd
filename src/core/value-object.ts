import type { Either } from "@sweet-monads/either";
import * as v from "valibot";
import { convertValibotResult } from "@/utils/valibot-errors-converter";
import type { ValueObjectValidationError } from "../types/value-object.validation-error";

type DeepUnwrap<T> =
  T extends ValueObject<infer U>
    ? DeepUnwrap<U>
    : T extends ReadonlyArray<infer U>
      ? Array<DeepUnwrap<U>>
      : T extends object
        ? { [K in keyof T]: DeepUnwrap<T[K]> }
        : T;

type ValueObjectToPrimitiveResult<T> = keyof T extends infer K
  ? K extends keyof T
    ? keyof T extends K
      ? DeepUnwrap<T[K]>
      : DeepUnwrap<T>
    : DeepUnwrap<T>
  : DeepUnwrap<T>;

export abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  /**
   * Сравнивает два Value Objects на равенство по значению.
   *
   * @param vo - ValueObject для сравнения.
   * @returns true, если объекты равны по значению; false в противном случае.
   */
  public equals(vo?: ValueObject<T> | null): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (this === vo) {
      return true;
    }
    return this.isDeepEqual(this.props, vo.props);
  }

  private isDeepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;

    if (a instanceof ValueObject && b instanceof ValueObject) {
      return a.equals(b);
    }

    if (a === null || b === null || typeof a !== "object" || typeof b !== "object") {
      return a === b;
    }

    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!this.isDeepEqual(a[i], b[i])) return false;
      }
      return true;
    }

    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!Object.hasOwn(objB, key)) {
        return false;
      }
      if (!this.isDeepEqual(objA[key], objB[key])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Возвращает примитивное (JSON-сериализуемое) представление Value Object.
   * Полезно для логирования, сохранения в БД или передачи в DTO.
   *
   * @returns Поверхностная копия свойств Value Object.
   */
  public toPrimitive(): ValueObjectToPrimitiveResult<T> {
    const isObject = typeof this.props === "object" && this.props !== null;

    if (isObject && Object.keys(this.props).length === 1) {
      const key = Object.keys(this.props)[0];
      if (key !== undefined) {
        const value = (this.props as Record<string, unknown>)[key];
        if (value instanceof ValueObject) {
          return value.toPrimitive() as ValueObjectToPrimitiveResult<T>;
        }
        return value as ValueObjectToPrimitiveResult<T>;
      }
    }

    if (!isObject || this.props instanceof ValueObject) {
      if (this.props instanceof ValueObject) {
        return this.props.toPrimitive() as ValueObjectToPrimitiveResult<T>;
      }
      return this.props as ValueObjectToPrimitiveResult<T>;
    }

    const unwrappedProps: T = (Array.isArray(this.props) ? [] : {}) as T;

    for (const key in this.props) {
      if (Object.hasOwn(this.props, key)) {
        const value = (this.props as Record<string, unknown>)[key];
        (unwrappedProps as Record<string, unknown>)[key] = this.deepUnwrapRecursively(value);
      }
    }
    return unwrappedProps as ValueObjectToPrimitiveResult<T>;
  }

  private deepUnwrapRecursively(item: unknown): unknown {
    if (item instanceof ValueObject) {
      return item.toPrimitive();
    }
    if (typeof item !== "object" || item === null) {
      return item;
    }
    if (Array.isArray(item)) {
      return item.map((element) => this.deepUnwrapRecursively(element));
    }
    const result: Record<string, unknown> = {};
    for (const key in item) {
      if (Object.hasOwn(item, key)) {
        result[key] = this.deepUnwrapRecursively((item as Record<string, unknown>)[key]);
      }
    }
    return result;
  }
}

export function createValueObjectFactory<
  Schema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  VObject extends ValueObject<v.InferOutput<Schema>>,
>(schema: Schema, from: (props: v.InferOutput<Schema>) => VObject) {
  return function create(
    value: v.InferInput<Schema>,
    validationKey: string,
  ): Either<ValueObjectValidationError, VObject> {
    const parseResult = v.safeParse(schema, value);
    return convertValibotResult(parseResult, validationKey).map(from);
  };
}
