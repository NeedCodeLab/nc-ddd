import { Data } from "effect";

/**
 * Ошибка валидации полей.
 * Выбрасывается при нарушении правил валидации полей.
 *
 */
export class EffectFieldError extends Data.TaggedError("EffectFieldError")<{
  message: string;
  errorKey: string;
}> {}

export type EffectValidationErrorMap = Record<string, string[]>;

export class EffectValidationError extends Data.TaggedError("EffectValidationError")<{
  errors: EffectValidationErrorMap;
}> {}
