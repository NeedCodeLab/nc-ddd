import type * as v from "valibot";
import { Entity, type IEntityProps, type InferEntityProps } from "./entity.js";
import { VO } from "./vo.js";

type AllowedAgregateRootPropValue =
  | VO<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>
  | Array<VO<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>>
  | Entity<IEntityProps>
  | Array<Entity<IEntityProps>>;

export type InferPropType<T> =
  T extends ReadonlyArray<infer U>
    ? InferPropType<U>[]
    : T extends VO<infer S>
      ? v.InferInput<S>
      : T extends Entity<infer P>
        ? InferEntityProps<P>
        : never;

export type InferAgregateRootProps<T> = {
  [K in keyof T]: InferPropType<T[K]>;
};

/**
 * @class AgregateRoot
 * @description Base class for aggregate roots in DDD. An aggregate root is a specific type of entity that acts as a gateway to a cluster of associated objects.
 * @template Props - The properties of the aggregate root. Must include an 'id' property which is a Value Object.
 */
export abstract class AgregateRoot<
  Props extends IEntityProps & Record<keyof Props, AllowedAgregateRootPropValue>,
> {
  public readonly props: Props;

  /**
   * The constructor is protected to enforce creation through factory methods in subclasses.
   * @param props The properties of the aggregate root.
   */
  protected constructor(props: Props) {
    this.props = props;
  }

  /**
   * Getter for the aggregate root's identifier (ID).
   * @returns {Props["id"]} The unique identifier of the aggregate root.
   */
  get id(): Props["id"] {
    return this.props.id as Props["id"];
  }

  get primitive(): InferAgregateRootProps<Props> {
    const toPrim = (p: unknown) => {
      if (p instanceof Entity) {
        return p.primitive;
      }
      if (p instanceof VO) {
        return p.value;
      }
      return p;
    };

    return Object.fromEntries(
      Object.entries(this.props).map(([key, prop]) => {
        if (Array.isArray(prop)) {
          return [key, prop.map(toPrim)];
        }
        return [key, toPrim(prop)];
      }),
    ) as InferAgregateRootProps<Props>;
  }

  /**
   * Compares this aggregate root with another for equality.
   * Aggregate roots are considered equal if they have the same identifier.
   * @param other The other aggregate root to compare with.
   * @returns {boolean} `true` if they are equal, `false` otherwise.
   */
  public isEqual(other?: AgregateRoot<Props>): boolean {
    if (other === null || other === undefined) {
      return false;
    }

    if (this === other) {
      return true;
    }

    if (!(other instanceof AgregateRoot)) {
      return false;
    }

    return this.id.isEqual(other.id);
  }
}
