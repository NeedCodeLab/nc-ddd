// import { MultipleVO } from "../example/value-objects/multiple.vo";
import { merge } from "@sweet-monads/either";
import { MultipleVO } from "../example/value-objects/multiple.vo";
import { SimpleVO } from "../example/value-objects/simple.vo";

describe("Simple vo tests", () => {
  it("single field right case", () => {
    const eitherVO = SimpleVO.create("some_value");
    eitherVO.fold(
      () => fail("Expected a Right, but received a Left"),
      (vo) => {
        expect(vo.value).toBe("some_value");
      },
    );
  });
  it("single field left case", () => {
    const eitherVO = SimpleVO.create("");
    eitherVO.fold(
      (error) => {
        expect(error.root).toEqual(["It can`t be empty"]);
      },
      () => fail("Expected a Left, but received a Right"),
    );
  });
  it("should be equal", () => {
    const eitherVO1 = SimpleVO.create("some_value");
    const eitherVO2 = SimpleVO.create("some_value");
    merge([eitherVO1, eitherVO2]).fold(
      () => fail("Expected a Right, but received a Left"),
      ([vo1, vo2]) => {
        expect(vo1.isEqual(vo2)).toBe(true);
      },
    );
  });
  it("should not be equal", () => {
    const eitherVO1 = SimpleVO.create("some_value");
    const eitherVO2 = SimpleVO.create("some_value2");
    merge([eitherVO1, eitherVO2]).fold(
      () => fail("Expected a Right, but received a Left"),
      ([vo1, vo2]) => {
        expect(vo1.isEqual(vo2)).toBe(false);
      },
    );
  });
});

describe("Multiple vo tests", () => {
  it("multiple fields right case", () => {
    const eitherVO = MultipleVO.create({ type: "email", value: "mail@mail.com" });
    eitherVO.fold(
      () => fail("Expected a Right, but received a Left"),
      (vo) => {
        const primitive = vo.value;
        expect(primitive).toHaveProperty("type");
        expect(primitive).toHaveProperty("value");
        expect(primitive.type).toEqual("email");
        expect(primitive.value).toEqual("mail@mail.com");
      },
    );
  });

  it("should return error for invalid email in MultipleVO", () => {
    const eitherVO = MultipleVO.create({ type: "email", value: "invalid-email" });
    eitherVO.fold(
      (error) => {
        expect(error).toHaveProperty("nested");
        const contactError = error.nested;
        expect(contactError).toHaveProperty("value");
        expect(contactError?.value).toEqual(["Invalid email"]);
      },
      () => fail("Expected a Left, but received a Right"),
    );
  });

  it("should create MultipleVO with valid email", () => {
    const eitherVO = MultipleVO.create({ type: "email", value: "test@example.com" });
    eitherVO.fold(
      () => fail("Expected a Right, but received a Left"),
      (vo) => {
        const primitive = vo.value;
        expect(primitive).toHaveProperty("value");
        expect(primitive.value).toBe("test@example.com");
      },
    );
  });

  it("should be equal", () => {
    const eitherVO1 = MultipleVO.create({ type: "email", value: "test@example.com" });
    const eitherVO2 = MultipleVO.create({ type: "email", value: "test@example.com" });
    merge([eitherVO1, eitherVO2]).fold(
      () => fail("Expected a Right, but received a Left"),
      ([vo1, vo2]) => {
        expect(vo1.isEqual(vo2)).toBe(true);
      },
    );
  });
  it("should not be equal", () => {
    const eitherVO1 = MultipleVO.create({ type: "email", value: "test2@example.com" });
    const eitherVO2 = MultipleVO.create({ type: "email", value: "test@example.com" });
    merge([eitherVO1, eitherVO2]).fold(
      () => fail("Expected a Right, but received a Left"),
      ([vo1, vo2]) => {
        expect(vo1.isEqual(vo2)).toBe(false);
      },
    );
  });
});
