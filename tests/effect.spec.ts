import { Either } from "effect/index";
import { MultipleEffectVO } from "../examples/effect/value-objects/multiple.effect-vo";

describe("Simple effect vo tests", () => {
  it("multiple right", () => {
    const either = MultipleEffectVO.create({ type: "email", value: "mail@email.ru" });

    expect(Either.isRight(either)).toBe(true);
    if (Either.isRight(either)) {
      expect(either.right.value).toEqual({ type: "email", value: "mail@email.ru" });
    }
  });
  it("multiple left", () => {
    const either = MultipleEffectVO.create({ type: "email", value: "mailemail.ru" });
    expect(Either.isLeft(either)).toBe(true);
    if (Either.isLeft(either)) {
      expect(either.left).toEqual({ value: ["Invalid email"] });
    }
  });
});
