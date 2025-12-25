import { type Either, left, right } from "@sweet-monads/either";
import type { BaseIssue, BaseSchema, InferOutput, IssuePathItem, SafeParseResult } from "valibot";
import type { ValueObjectValidationError } from "../types/value-object.validation-error";

export function convertValibotResult<
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(
  result: SafeParseResult<TSchema>,
  validationKey: string,
): Either<ValueObjectValidationError, InferOutput<TSchema>> {
  if (!result.success) {
    const rootErrors: string[] = [];
    const nestedErrors: Record<string, unknown> = {};

    for (const issue of result.issues) {
      const message =
        issue.kind === "schema" && issue.received === "undefined" && issue.expected !== "undefined"
          ? "Поле является обязательным"
          : issue.message;

      if (issue.path && issue.path.length > 0) {
        let currentLevel: Record<string, unknown> = nestedErrors;
        for (let i = 0; i < issue.path.length; i++) {
          const pathItem: IssuePathItem | undefined = issue.path[i];
          if (!pathItem) {
            continue;
          }
          const pathKey = String(pathItem.key);

          if (i === issue.path.length - 1) {
            if (Array.isArray(currentLevel[pathKey])) {
              (currentLevel[pathKey] as string[]).push(message);
            } else {
              currentLevel[pathKey] = [message];
            }
          } else {
            if (
              !currentLevel[pathKey] ||
              typeof currentLevel[pathKey] !== "object" ||
              Array.isArray(currentLevel[pathKey])
            ) {
              currentLevel[pathKey] = {};
            }
            currentLevel = currentLevel[pathKey] as Record<string, unknown>;
          }
        }
      } else {
        rootErrors.push(message);
      }
    }

    const finalErrorObject: ValueObjectValidationError = {};

    if (Object.keys(nestedErrors).length > 0) {
      if (rootErrors.length > 0) {
        finalErrorObject[validationKey] = nestedErrors as Record<string, string[]>;
      } else {
        finalErrorObject[validationKey] = nestedErrors as Record<string, string[]>;
      }
    } else {
      finalErrorObject[validationKey] = rootErrors.length > 0 ? rootErrors : ["Validation failed"];
    }

    return left(finalErrorObject);
  }
  return right(result.output);
}
