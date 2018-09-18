import { maxLength5, required } from "../../src-modules/utils/validations";
import {
  combineValidators,
  isContainError,
  isDirty,
  pickInputPropsFromFieldProps,
  setErrors,
  toFormValues,
  validateField,
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
  it("should ignore invalid validators", () => {
    const validators = ["invalid validators1", "invalidateValidators2", required()] as any;
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

describe("#toFormValues", () => {
  it("should pick form values from form state", () => {
    const formState = createFormState({ hasError: false });
    expect(toFormValues(formState)).toEqual({
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

describe("#isDirty", () => {
  it("should return false if current value is equal original value", () => {
    expect(isDirty("test", "test")).toBe(false);
  });

  it("should return true if current value is not equal original value", () => {
    expect(isDirty("test", "test123")).toBe(true);
  });
});

describe("#validateField", () => {
  it("should return undefined when validate is not exist", () => {
    expect(validateField("test data", [])).toEqual(undefined);
  });
  it("should return undefined when validate is neither a function nor an array ", () => {
    expect(validateField("test data", [])).toEqual(undefined);
  });
  it("should handle the function validate", () => {
    expect(validateField("", required())).toEqual("no empty defaultValue");
  });
  it("should handle validate array", () => {
    const validators = [required(), maxLength5()];
    expect(validateField("test data", validators)).toEqual("defaultValue length must less than 5");
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
