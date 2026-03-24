import { Effect } from "effect";
import * as v from "valibot";
import type { VO } from "../core/vo.js";
import type { FieldErrors } from "./types.js";

export function voEffectFactory<S extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(
  value: unknown,
  schema: S,
  constructorFn: (props: v.InferOutput<S>) => VO<S>,
  key: string, // key теперь обязательный
): Effect.Effect<VO<S>, FieldErrors> {
  const parseResult = v.safeParse(schema, value);

  if (!parseResult.success) {
    const flat = v.flatten<typeof schema>(parseResult.issues);
    const errors: FieldErrors = {};

    const root = flat.root as string[] | undefined;
    const nested = flat.nested as Record<string, string[]> | undefined;

    if (root?.length) {
      errors[key] = root;
    }

    if (nested) {
      for (const [nestedPath, messages] of Object.entries(nested)) {
        const msgs = messages as string[] | undefined;
        if (msgs?.length) {
          errors[`${key}.${nestedPath}`] = msgs;
        }
      }
    }

    return Effect.fail(errors);
  }

  return Effect.succeed(constructorFn(parseResult.output));
}
