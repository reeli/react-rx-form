import { maxLength5, required } from "../../utils/validations";
import { combineValidators, convertArrayToObjWithKeyPaths, isFormContainsError } from "../utils";

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
  it("should return true if field state has error", () => {
    const formState = createFormState({ hasError: true });
    expect(isFormContainsError(formState)).toEqual(true);
  });
  it("should return false if field state has no error", () => {
    const formState = createFormState({ hasError: false });
    expect(isFormContainsError(formState)).toEqual(false);
  });
});

const createFormState = ({ hasError }: { hasError: boolean }) => {
  return {
    age: { name: "age", value: "10", error: undefined, dirty: false },
    members: [
      {
        firstName: {
          name: "members[0].firstName",
          value: "rui",
          error: hasError ? "not empty error" : undefined,
          dirty: false,
        },
        lastName: { name: "members[0].lastName", value: "li", error: undefined, dirty: false },
      },
      {
        firstName: { name: "members[1].firstName", value: "rui1", error: undefined, dirty: false },
        lastName: { name: "members[1].lastName", value: "li1", error: undefined, dirty: false },
      },
    ],
  };
};

describe("#getKeyPath", () => {
  it("should get correct key path", () => {
    const mockData = {
      members: [{ firstName: "rui", lastName: "li" }, { firstName: "rui1", lastName: "li1" }],
    };
    expect(convertArrayToObjWithKeyPaths(mockData)).toEqual({
      [`members[0].firstName`]: "rui",
      [`members[0].lastName`]: "li",
      [`members[1].firstName`]: "rui1",
      [`members[1].lastName`]: "li1",
    });
  });
});
