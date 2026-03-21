import { Effect } from "effect";

type MapOptionalResult<V, E, A> = undefined extends V
  ? null extends V
    ? Effect.Effect<A | null | undefined, E>
    : Effect.Effect<A | undefined, E>
  : null extends V
    ? Effect.Effect<A | null, E>
    : Effect.Effect<A, E>;

export function effectMapOptional<V, E, A>(
  value: V,
  factory: (value: NonNullable<V>) => Effect.Effect<A, E>,
): MapOptionalResult<V, E, A> {
  if (value === undefined) {
    return Effect.succeed(undefined) as unknown as MapOptionalResult<V, E, A>;
  }
  if (value === null) {
    return Effect.succeed(null) as unknown as MapOptionalResult<V, E, A>;
  }
  return factory(value as NonNullable<V>) as unknown as MapOptionalResult<V, E, A>;
}
