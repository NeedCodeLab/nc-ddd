import type { VOEffect } from "./vo-effect.js";

/**

 * Тип для допустимых свойств сущности.
 * Свойства могут быть VOEffect, массивами VOEffect, другими EntityEffect, скалярными значениями или null.
 */
export type AllowedEntityPropValue = VOEffect<unknown> | Array<VOEffect<unknown>>;

/**
 * Обязательные свойства для Entity — должен быть id.
 */
export interface IEntityEffectProps {
  id: VOEffect<unknown>;
}

/**
 * Тип для извлечения значения из VOEffect или массива VOEffect.
 */
export type InferVOEffect<T> =
  T extends ReadonlyArray<infer U>
    ? U extends VOEffect<infer V>
      ? V[]
      : never
    : T extends VOEffect<infer V>
      ? V
      : never;

/**
 * Тип для извлечения всех свойств сущности как простых значений.
 */
export type InferEntityEffectProps<T> = {
  [K in keyof T]: InferVOEffect<T[K]>;
};

/**
 * Базовый класс для Entity в DDD с использованием Effect.
 * Entity — это объект с уникальной идентичностью, который сохраняется во времени.
 * Сущности сравниваются по идентификатору, а не по значению.
 *
 * @template Props — тип свойств сущности (должен включать id)
 */
export abstract class EntityEffect<Props extends IEntityEffectProps> {
  protected readonly _props: Props;

  /**
   * Конструктор защищён для создания Entity только через factory методы.
   * @param props — валидированные свойства сущности
   */
  protected constructor(props: Props) {
    this._props = props;
  }

  /**
   * Геттер для доступа к свойствам сущности.
   * @returns Свойства сущности
   */
  get props(): Props {
    return this._props;
  }

  /**
   * Геттер для доступа к идентификатору сущности.
   * @returns Идентификатор сущности
   */
  get id(): Props["id"] {
    return this._props.id;
  }

  /**
   * Сравнение двух Entity по идентификатору.
   * @param other — другая сущность для сравнения
   * @returns true, если идентификаторы равны
   */
  isEqual(other?: EntityEffect<IEntityEffectProps>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    if (!(other instanceof EntityEffect)) {
      return false;
    }
    return this.id.isEqual(other.id);
  }

  /**
   * Преобразует сущность в простой POJO-объект с обычными значениями.
   * @returns Объект с полями сущности, где VOEffect заменены на их значения
   */
  get primitive(): InferEntityEffectProps<Props> {
    return Object.fromEntries(
      Object.entries(this._props).map(([k, v]) => {
        if (v === null) {
          return [k, v];
        }
        if (Array.isArray(v)) {
          return [k, v.map((i) => i.primitive)];
        }
        return [k, v.primitive];
      }),
    ) as InferEntityEffectProps<Props>;
  }
}
