import { maxLength5, required } from "../../utils/validations";
import {
  combineValidators,
  getFormValues,
  isContainError,
  pickInputPropsFromFieldProps,
  setErrors,
  toObjWithKeyPath,
} from "../utils";

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

describe("#isContainError", () => {
  it("should return true if field state has error", () => {
    const formState = createFormState({ hasError: true });
    expect(isContainError(formState)).toEqual(true);
  });

  it("should return false if field state has no error", () => {
    const formState = createFormState({ hasError: false });
    expect(isContainError(formState)).toEqual(false);
  });
});

describe("#getFormValues", () => {
  it("should pick form values from form state", () => {
    const formState = createFormState({ hasError: false });
    expect(getFormValues(formState)).toEqual({
      members: [{ firstName: "rui", lastName: "li", hobbies: ["swimming"] }],
    });
  });
});

describe("#setErrors", () => {
  it("should set errors to formState if errors exist", () => {
    const formState = createFormState({ hasError: false });
    const errors = {
      "members[0].firstName": "field can not be empty",
    };
    const expectedResult = {
      "members[0].firstName": {
        name: "members[0].firstName",
        value: "rui",
        meta: { dirty: true, error: "field can not be empty" },
      },
      "members[0].lastName": { name: "members[0].lastName", value: "li", meta: { dirty: true } },
      "members[0].hobbies[0]": {
        name: "members[0].hobbies[0]",
        value: "swimming",
        meta: {
          error: undefined,
          dirty: true,
        },
      },
    };
    expect(setErrors(formState, errors)).toEqual(expectedResult);
  });
  it("should do nothing if errors not exist", () => {
    const formState = createFormState({ hasError: false });
    const errors = {};
    expect(setErrors(formState, errors)).toEqual(formState);
  });
});

describe("#toObjWithKeyPath", () => {
  it("should covert to simple object with correct key path", () => {
    const mockData = {
      firstName: "rui",
      lastName: "li",
      age: 10,
      isSelected: true,
    };

    expect(toObjWithKeyPath(mockData)).toEqual({
      firstName: "rui",
      lastName: "li",
      age: 10,
      isSelected: true,
    });
  });

  it("should covert to complicated object with correct key path", () => {
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

describe("#pickInputPropsFromFieldProps", () => {
  it("should pick correct input props from field props", () => {
    const mockOnChange = () => {};
    const fieldProps = {
      name: "members[0].firstName",
      value: "rui",
      meta: { dirty: true, error: "no empty error" },
      onChange: mockOnChange,
    };
    expect(pickInputPropsFromFieldProps(fieldProps)).toEqual({
      name: "members[0].firstName",
      value: "rui",
      error: "no empty error",
      onChange: mockOnChange,
    });
  });
});

const createFormState = ({ hasError }: { hasError: boolean }) => {
  return {
    "members[0].firstName": { name: "members[0].firstName", value: "rui", meta: { dirty: true } },
    "members[0].lastName": { name: "members[0].lastName", value: "li", meta: { dirty: true } },
    "members[0].hobbies[0]": {
      name: "members[0].hobbies[0]",
      value: "swimming",
      meta: {
        error: hasError ? "no empty defaultValue" : undefined,
        dirty: true,
      },
    },
  };
};
