import { type Either, right } from "effect/Either";

type MapOptionalResult<V, L, R> = undefined extends V
  ? null extends V
    ? Either<L, R | null | undefined>
    : Either<L, R | undefined>
  : null extends V
    ? Either<L, R | null>
    : Either<L, R>;

export function mapOptional<V, L, R>(value: V, factory: (value: NonNullable<V>) => Either<L, R>) {
  if (value === undefined) {
    return right(undefined);
  }

  if (value === null) {
    return right(null);
  }

  return factory(value as NonNullable<V>) as MapOptionalResult<V, L, R>;
}
