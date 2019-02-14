import { formSetErrors, isFormValid } from "../formHelpers";

describe("#formSetErrors", () => {
  it("should set errors to formState if errors exist", () => {
    const formState = createFormState({ hasError: false });
    const errors = {
      "members[0].firstName": "field can not be empty",
    };
    const expectedResult = {
      "members[0].firstName": {
        dirty: true,
        error: "field can not be empty",
      },
      "members[0].lastName": {
        dirty: true,
      },
      "members[0].hobbies[0]": {
        dirty: true,
      },
    };
    expect(formSetErrors(errors, formState)).toEqual(expectedResult);
  });
  it("should do nothing if errors not exist", () => {
    const formState = createFormState({ hasError: false });
    const errors = {};
    expect(formSetErrors(errors, formState)).toEqual(formState);
  });

  it("should set partial fields errors", () => {
    const mockFields = {
      username: {
        dirty: true,
        touched: true,
        error: undefined,
      },
      password: {
        dirty: true,
        touched: false,
        error: "xx error",
      },
    };

    const expected = {
      username: {
        dirty: true,
        touched: true,
        error: "no empty error",
      },
      password: {
        dirty: true,
        touched: false,
        error: "not empty error",
      },
    };

    expect(
      formSetErrors(
        {
          username: "no empty error",
          password: "not empty error",
          age: "",
        },
        mockFields,
      ),
    ).toEqual(expected);
  });

  it("should clear fields errors when pass empty object as errors", () => {
    const mockFields = {
      username: {
        dirty: true,
        touched: true,
        error: "not empty error",
      },
      password: {
        dirty: true,
        touched: false,
        error: "xx error",
      },
    };

    const expected = {
      username: {
        dirty: true,
        touched: true,
        error: undefined,
      },
      password: {
        dirty: true,
        touched: false,
        error: undefined,
      },
    };

    expect(formSetErrors({}, mockFields)).toEqual(expected);
  });
});

describe("#isFormValid", () => {
  it("should return true if field state has no error", () => {
    const formState = createFormState({ hasError: false });
    expect(isFormValid(formState)).toEqual(true);
  });

  it("should return false if field state has error", () => {
    const formState = createFormState({ hasError: true });
    expect(isFormValid(formState)).toEqual(false);
  });
});

const createFormState = ({ hasError }: { hasError: boolean }) => {
  return {
    "members[0].firstName": { dirty: true },
    "members[0].lastName": { dirty: true },
    "members[0].hobbies[0]": {
      error: hasError ? "no empty defaultValue" : undefined,
      dirty: true,
    },
  };
};
