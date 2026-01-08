import { type Either, left, right } from "@sweet-monads/either";
import type { BaseIssue, BaseSchema } from "valibot";
import type { Entity, InferEntityProps } from "@/core/entity";
import type { VO } from "@/core/vo";

type VOSchema = BaseSchema<unknown, unknown, BaseIssue<unknown>>;
type AnyVO = VO<VOSchema>;

type VOErrors = string[] | Record<string, unknown> | undefined;

type VOCreator<I, V extends AnyVO> = (value: I) => Either<VOErrors, V>;

export type EntityPropsCreators<
  Props extends Record<string, unknown>,
  DTO extends { [K in keyof Props]: unknown },
> = {
  [K in keyof Props]: Props[K] extends (infer V)[]
    ? V extends AnyVO
      ? VOCreator<DTO[K] extends (infer I)[] ? I : never, V>
      : never
    : Props[K] extends AnyVO
      ? VOCreator<DTO[K], Props[K]>
      : never;
};

type Errors<Props> = {
  [K in keyof Props]?: Props[K] extends unknown[] ? Record<number, VOErrors> : VOErrors;
};

export function entityFactory<
  Props extends { [key: string]: AnyVO | AnyVO[] },
  E extends Entity<Props>,
  DTO extends InferEntityProps<Props>,
>(
  dto: DTO,
  creators: EntityPropsCreators<Props, DTO>,
  constructorFn: (props: Props) => E,
): Either<Errors<Props>, E> {
  const props = {} as Props;
  const errors: Errors<Props> = {};

  for (const key of Object.keys(creators) as (keyof Props)[]) {
    const creator = creators[key];
    const value = (dto as InferEntityProps<Props>)[key];

    if (Array.isArray(value)) {
      const arrayProps: AnyVO[] = [];
      const arrayErrors: Record<number, VOErrors> = {};

      (value as unknown[]).forEach((item, index) => {
        const result = (creator as VOCreator<unknown, AnyVO>)(item);
        if (result.isLeft()) {
          arrayErrors[index] = result.value;
        } else {
          arrayProps.push(result.value);
        }
      });

      if (Object.keys(arrayErrors).length > 0) {
        errors[key] = arrayErrors as Errors<Props>[keyof Props];
      } else {
        props[key] = arrayProps as Props[keyof Props];
      }
    } else {
      const result = (creator as VOCreator<unknown, AnyVO>)(value);
      if (result.isLeft()) {
        errors[key] = result.value as Errors<Props>[keyof Props];
      } else {
        props[key] = result.value as Props[keyof Props];
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return left(errors);
  }

  return right(constructorFn(props));
}
