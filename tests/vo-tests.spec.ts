import { MultipleVO } from "../example/value-objects/multiple.vo";
import { SimpleVO } from "../example/value-objects/simple.vo";

describe("Simple vo tests", () => {
  it("single field right case", () => {
    const eitherVO = SimpleVO.create("some_value", "name");
    eitherVO.fold(
      () => fail("Expected a Right, but received a Left"),
      (vo) => {
        expect(vo.toPrimitive()).toBe("some_value");
      },
    );
  });
  it("single field left case", () => {
    const eitherVO = SimpleVO.create("", "name");
    eitherVO.fold(
      (error) => {
        expect(error).toHaveProperty("name");
        expect(error.name).toEqual(["It can`t be empty"]);
      },
      () => fail("Expected a Left, but received a Right"),
    );
  });
});

describe("Multiple vo tests", () => {
  it("multiple fields right case", () => {
    const eitherVO = MultipleVO.create({ type: "email", value: "mail@mail.com" }, "contact");
    eitherVO.fold(
      () => fail("Expected a Right, but received a Left"),
      (vo) => {
        const primitive = vo.toPrimitive();
        expect(primitive).toHaveProperty("type");
        expect(primitive).toHaveProperty("value");
        expect(primitive.type).toEqual("email");
        expect(primitive.value).toEqual("mail@mail.com");
      },
    );
  });

  it("should return error for invalid email in MultipleVO", () => {
    const eitherVO = MultipleVO.create({ type: "email", value: "invalid-email" }, "contact");
    eitherVO.fold(
      (error) => {
        expect(error).toHaveProperty("contact");
        const contactError = error.contact as Record<string, string[]>;
        expect(contactError).toHaveProperty("value");
        expect(contactError.value).toEqual(["Invalid email"]);
      },
      () => fail("Expected a Left, but received a Right"),
    );
  });

  it("should create MultipleVO with valid email", () => {
    const eitherVO = MultipleVO.create({ type: "email", value: "test@example.com" }, "contact");
    eitherVO.fold(
      () => fail("Expected a Right, but received a Left"),
      (vo) => {
        const primitive = vo.toPrimitive();
        expect(primitive.value).toBe("test@example.com");
      },
    );
  });
});
