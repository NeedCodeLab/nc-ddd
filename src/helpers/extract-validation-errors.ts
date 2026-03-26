import { Option } from "effect";
import { EffectBusinessRuleError } from "@/errors/business-rule.error";
import {
  EffectFieldError,
  ValidationError,
  type ValidationErrorMap,
} from "@/errors/validation.error";

function flattenCause(
  value: unknown,
  prefix: string,
  errors: ValidationErrorMap,
): EffectBusinessRuleError | null {
  if (!Option.isOption(value) || Option.isNone(value)) return null;

  const inner = value.pipe(Option.getOrThrow);

  if (Array.isArray(inner)) {
    for (const [i, item] of inner.entries()) {
      const bizError = flattenCause(item, `${prefix}.${i}`, errors);
      if (bizError) return bizError;
    }
    return null;
  }

  if (inner instanceof ValidationError) {
    for (const [key, messages] of Object.entries(inner.errors)) {
      const fullKey = `${prefix}.${key}`;
      if (!errors[fullKey]) errors[fullKey] = [];
      for (const msg of messages) {
        errors[fullKey].push(msg);
      }
    }
    return null;
  }

  if (inner instanceof EffectFieldError) {
    if (!errors[prefix]) errors[prefix] = [];
    errors[prefix].push(inner.message);
    return null;
  }

  // Бизнес-ошибку сразу возвращаем наверх — не трогаем errors
  if (inner instanceof EffectBusinessRuleError) {
    return inner;
  }

  if (Option.isOption(inner)) {
    return flattenCause(inner, prefix, errors);
  }

  return null;
}

export function extractValidationError(
  cause: Record<string, unknown>,
): ValidationError | EffectBusinessRuleError {
  const errors: ValidationErrorMap = {};

  for (const [key, value] of Object.entries(cause)) {
    const bizError = flattenCause(value, key, errors);
    if (bizError) return bizError;
  }

  return new ValidationError({ errors });
}
