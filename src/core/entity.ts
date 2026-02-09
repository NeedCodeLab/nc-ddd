import type * as v from "valibot";
import type { VO } from "./vo.js";

type AllowedEntityPropValue =
  | VO<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>
  | Array<VO<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>>
  | null;

export type IEntityProps = {
  id: VO<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>;
};

export type InferValibot<T> =
  T extends ReadonlyArray<infer U>
    ? InferValibot<U>[]
    : T extends VO<infer S>
      ? v.InferInput<S>
      : never;

export type InferEntityProps<T> = {
  [K in keyof T]: InferValibot<T[K]>;
};

/**
 * @class Entity
 * @description Base class for entities in DDD. An entity is an object with a unique identity that persists over time.
 * @template Props - The properties of the entity. Must include an 'id' property which is a Value Object.
 */
export abstract class Entity<
  Props extends IEntityProps & Record<keyof Props, AllowedEntityPropValue>,
> {
  public readonly props: Props;

  /**
   * The constructor is protected to enforce creation through factory methods in subclasses.
   * @param props The properties of the entity.
   */
  protected constructor(props: Props) {
    this.props = props;
  }

  /**
   * Getter for the entity's identifier (ID).
   * @returns {Props["id"]} The unique identifier of the entity.
   */
  get id(): Props["id"] {
    return this.props.id as Props["id"];
  }

  get primitive(): InferEntityProps<Props> {
    return Object.fromEntries(
      Object.entries(this.props).map(([k, v]) => {
        if (v === null) {
          return [k, v];
        }
        if (Array.isArray(v)) {
          return [k, v.map((i) => i.value)];
        }
        return [k, v.value];
      }),
    ) as InferEntityProps<Props>;
  }

  /**
   * Compares this entity with another for equality.
   * Entities are considered equal if they have the same identifier.
   * @param other The other entity to compare with.
   * @returns {boolean} `true` if the entities are equal, `false` otherwise.
   */
  public isEqual(other?: Entity<Props>): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (this === other) {
      return true;
    }

    if (!(other instanceof Entity)) {
      return false;
    }

    return this.id.isEqual(other.id);
  }
}
