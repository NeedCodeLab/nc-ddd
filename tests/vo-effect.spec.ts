import { Effect, Either, pipe } from "effect/index";
import { extractEffectErrors } from "@/index";
import { MultipleEffectVO } from "../examples/effect/value-objects/multiple.effect-vo";

describe("Simple effect vo tests", () => {
  it("multiple right", () => {
    const program = pipe(
      MultipleEffectVO.create({ type: "email", value: "mail@email.ru" }, "value"),
      Effect.mapError((cause) => extractEffectErrors(cause)),
      Effect.either,
      Effect.runSync,
    );
    Either.match(program, {
      onLeft: () => fail("Expected right, but got left"),
      onRight: (data) => expect(data.value).toEqual({ type: "email", value: "mail@email.ru" }),
    });
  });
  it("multiple left", () => {
    const program = pipe(
      MultipleEffectVO.create({ type: "email", value: "mailemail.ru" }, "value"),
    );
    Effect.match(program, {
      onFailure: (errors) => expect(errors).toEqual({ "value.value": ["Invalid email"] }),
      onSuccess: () => fail("Expected left, but got right"),
    });
    // if (Effect.isFailure(effect)) {
    //   expect(effect).toEqual({ "value.value": ["Invalid email"] });
    // }
  });
});
