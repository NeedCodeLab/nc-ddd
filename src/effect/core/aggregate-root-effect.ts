import { EntityEffect, type IEntityEffectProps } from "./entity-effect.js";
import type { VOEffect } from "./vo-effect.js";

/**
 * Тип для допустимых свойств агрегата.
 * Агрегаты могут содержать VOEffect, EntityEffect, массивы этих типов, скаляры или null.
 */
export type AllowedAggregateRootPropValue =
  | VOEffect<unknown>
  | Array<VOEffect<unknown>>
  | EntityEffect<IEntityEffectProps>
  | Array<EntityEffect<IEntityEffectProps>>;

/**
 * Базовый класс для Aggregate Root в DDD с использованием Effect.
 * Aggregate Root — это корень агрегата, группа связанных объектов,
 * которые рассматриваются как единое целое.
 *
 * @template Props — тип свойств агрегата (должен включать id)
 */
export abstract class AggregateRootEffect<
  Props extends IEntityEffectProps,
> extends EntityEffect<Props> {
  /**
   * Конструктор защищён для создания Aggregate Root только через factory методы.
   * @param props — валидированные свойства агрегата
   */
  protected constructor(props: Props) {
    super(props);
  }
}
