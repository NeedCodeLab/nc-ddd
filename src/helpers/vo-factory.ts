import { left, right } from "@sweet-monads/either";
import * as v from "valibot";
import type { VO } from "@/core/vo";

export function voFactory<S extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(
  value: unknown,
  schema: S,
  constructorFn: (props: v.InferOutput<S>) => VO<S>,
  key?: string,
) {
  const parseResult = v.safeParse(schema, value);
  if (!parseResult.success) {
    const flattedErrors = v.flatten<typeof schema>(parseResult.issues);
    const errorsRes = flattedErrors.root || flattedErrors.nested || flattedErrors.other;
    return left(
      key
        ? {
            [key]: errorsRes,
          }
        : errorsRes,
    );
  }
  return right(constructorFn(parseResult.output));
}
