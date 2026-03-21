import * as v from "valibot";
import { Effect } from "effect";
import { VO } from "@/core/vo";
import { voEffectFactory, type FieldErrors } from "@/helpers/vo-effect-factory";

export const EmployeeNameVOSchema = v.pipe(
  v.string("Name must be a string"),
  v.trim(),
  v.nonEmpty("Name can`t be empty"),
);

export type EmployeeNameVOProps = v.InferOutput<typeof EmployeeNameVOSchema>;

export class EmployeeNameVO extends VO<typeof EmployeeNameVOSchema> {
  private constructor(props: EmployeeNameVOProps) {
    super(props);
  }

  public static create = (
    val: v.InferInput<typeof EmployeeNameVOSchema>,
    key = "name",
  ): Effect.Effect<EmployeeNameVO, FieldErrors> => {
    return Effect.flatMap(
      voEffectFactory(val, EmployeeNameVOSchema, (props) => new EmployeeNameVO(props), key),
      (vo) => {
        if (vo.value.length > 20) {
          return Effect.fail({ [key]: ["Имя слишком длинное (макс. 20 символов)"] });
        }
        return Effect.succeed(vo);
      },
    );
  };
}
