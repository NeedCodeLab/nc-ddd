import assert from "node:assert/strict";

/**
 * Базовый класс для Value Objects в DDD с использованием Effect.
 * Value Objects — это объекты, которые определяются своими атрибутами, а не идентичностью.
 * Они иммутабельны и сравниваются по значению.
 *
 * @template T — тип значения Value Object
 */
export abstract class VOEffect<T> {
  private readonly _value: T;

  /**
   * Конструктор защищён для создания VO только через factory методы.
   * @param value — валидированное значение
   */
  protected constructor(value: T) {
    this._value = value;
  }

  /**
   * Геттер для доступа к значению VO.
   * @returns Значение Value Object
   */
  get primitive(): T {
    return this._value;
  }

  /**
   * Сравнение двух VO по значению.
   * @param other — другой VO для сравнения
   * @returns true, если значения равны
   */

  isEqual(other: VOEffect<T>) {
    try {
      assert.deepStrictEqual(other.primitive, this.primitive);
      return true;
    } catch {
      return false;
    }
  }
}
