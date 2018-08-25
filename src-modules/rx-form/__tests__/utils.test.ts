import { maxLength5, required } from "../../utils/validations";
import { combineValidators, isContainError, toObjWithKeyPath } from "../utils";

describe("#combineValidators", () => {
  it("should get error message when combineValidators validators with error", () => {
    const validators = [required(), maxLength5()];
    expect(combineValidators(validators)("test data")).toEqual("defaultValue length must less than 5");
  });
  it("should get undefined when combineValidators validators without error", () => {
    const validators = [required(), maxLength5()];
    expect(combineValidators(validators)("test")).toEqual(undefined);
  });
});

describe("#validateFormState", () => {
  const createFormState = ({ hasError }: { hasError: boolean }) => {
    return {
      "members[0].firstName": { name: "members[0].firstName", value: "rui", meta: { dirty: true } },
      "members[0].lastName": { name: "members[0].lastName", value: "li", meta: { dirty: true } },
      "members[0].hobbies[0]": {
        name: "members[0].hobbies[0]",
        value: "",
        meta: {
          error: hasError ? "no empty defaultValue" : undefined,
          dirty: true,
        },
      },
    };
  };

  it("should return true if field state has error", () => {
    const formState = createFormState({ hasError: true });
    expect(isContainError(formState)).toEqual(true);
  });

  it("should return false if field state has no error", () => {
    const formState = createFormState({ hasError: false });
    expect(isContainError(formState)).toEqual(false);
  });
});

describe("#toObjWithKeyPath", () => {
  it("should covert to object with correct key path", () => {
    const mockData = {
      firstName: "rui",
      lastName: "li",
      members: [
        { firstName: "rui", lastName: "li", hobbies: ["running", "swimming"] },
        { firstName: "rui1", lastName: "li1" },
      ],
    };

    expect(toObjWithKeyPath(mockData)).toEqual({
      firstName: "rui",
      lastName: "li",
      [`members[0].firstName`]: "rui",
      [`members[0].lastName`]: "li",
      [`members[0].hobbies[0]`]: "running",
      [`members[0].hobbies[1]`]: "swimming",
      [`members[1].firstName`]: "rui1",
      [`members[1].lastName`]: "li1",
    });
  });
});
