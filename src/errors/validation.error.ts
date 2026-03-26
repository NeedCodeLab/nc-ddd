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

export type ValidationErrorMap = Record<string, string[]>;

export class ValidationError extends Data.TaggedError("ValidationError")<{
  errors: ValidationErrorMap;
}> {}
