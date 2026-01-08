import { type Either, left, right } from "@sweet-monads/either";
import type { BaseIssue, BaseSchema } from "valibot";
import type { Entity, InferEntityProps } from "@/core/entity";
import type { VO } from "@/core/vo";

type VOSchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;
type AnyVO = VO<VOSchema>;

type VOErrors = string[] | Record<string, unknown> | undefined;

type VOCreator<I, V extends AnyVO> = (value: I) => Either<VOErrors, V>;

// biome-ignore lint/suspicious/noExplicitAny: <maybe later>
type AnyVOClass<I = any, V extends AnyVO = AnyVO> = {
  create: VOCreator<I, V>;
};

type AnyVOClassOrArray = AnyVOClass | readonly [AnyVOClass];

type Classes = Record<string, AnyVOClassOrArray>;

export type InferPropsFromClasses<T extends Classes> = {
  // biome-ignore lint/suspicious/noExplicitAny: <maybe later>
  [K in keyof T]: T[K] extends readonly [AnyVOClass<any, infer V>]
    ? V[]
    : // biome-ignore lint/suspicious/noExplicitAny: <maybe later>
      T[K] extends AnyVOClass<any, infer V>
      ? V
      : never;
};

type Errors<Props> = {
  [K in keyof Props]?: Props[K] extends unknown[] ? Record<number, VOErrors> : VOErrors;
};

export function entityFactory<
  const C extends Classes,
  Props extends InferPropsFromClasses<C>,
  E extends Entity<Props>,
>(
  dto: InferEntityProps<Props>,
  classes: C,
  constructorFn: (props: Props) => E,
): Either<Errors<Props>, E> {
  const props = {} as Props;
  const errors: Errors<Props> = {};

  for (const key of Object.keys(classes) as (keyof C)[]) {
    const classOrArray = classes[key];
    const voClass = Array.isArray(classOrArray) ? classOrArray[0] : classOrArray;
    const creator = voClass.create;
    const value = dto[key as keyof Props];

    if (Array.isArray(value)) {
      const arrayProps: AnyVO[] = [];
      const arrayErrors: Record<number, VOErrors> = {};

      (value as unknown[]).forEach((item, index) => {
        const result = creator(item);
        if (result.isLeft()) {
          arrayErrors[index] = result.value;
        } else {
          arrayProps.push(result.value);
        }
      });

      if (Object.keys(arrayErrors).length > 0) {
        errors[key as keyof Props] = arrayErrors as Errors<Props>[keyof Props];
      } else {
        props[key as keyof Props] = arrayProps as Props[keyof Props];
      }
    } else {
      const result = creator(value);
      if (result.isLeft()) {
        errors[key as keyof Props] = result.value as Errors<Props>[keyof Props];
      } else {
        props[key as keyof Props] = result.value as Props[keyof Props];
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return left(errors);
  }

  return right(constructorFn(props));
}
