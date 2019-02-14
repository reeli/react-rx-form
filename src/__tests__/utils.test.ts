import { maxLength5, required } from "../../src-modules/utils/validations";
import {
  combineValidators,
  isDirty,
  isEmptyValue,
  pickInputPropsFromFieldProps,
  pickValue,
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

describe("#pickInputPropsFromFieldProps", () => {
  it("should pick correct input props from field props", () => {
    const mockOnChange = () => {};
    const mockOnBlur = () => {};
    const mockOnFocus = () => {};
    const fieldProps = {
      name: "members[0].firstName",
      value: "rui",
      meta: {
        error: "no empty error",
        dirty: true,
      },
      onChange: mockOnChange,
      onBlur: mockOnBlur,
      onFocus: mockOnFocus,
    };
    expect(pickInputPropsFromFieldProps(fieldProps)).toEqual({
      name: "members[0].firstName",
      value: "rui",
      error: "no empty error",
      onChange: mockOnChange,
      onBlur: mockOnBlur,
      onFocus: mockOnFocus,
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
  it("should return undefined if validate not exist", () => {
    expect(validateField("test data", undefined)).toEqual(undefined);
  });
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

describe("#isEmptyValue", () => {
  it("should return true if value is empty string/object/array/null/undefined ", () => {
    expect(isEmptyValue(undefined)).toEqual(true);
    expect(isEmptyValue(null)).toEqual(true);
    expect(isEmptyValue([])).toEqual(true);
    expect(isEmptyValue("")).toEqual(true);
    expect(isEmptyValue({})).toEqual(true);
  });
  it("should return false if value is number or boolean", () => {
    expect(isEmptyValue(0)).toEqual(false);
    expect(isEmptyValue(false)).toEqual(false);
    expect(isEmptyValue(() => {})).toEqual(false);
  });
});

describe("#pickValue", () => {
  it("should pick value from event", () => {
    const mockEvent = {
      target: {
        value: "xxx",
      },
    };
    expect(pickValue(mockEvent)).toEqual("xxx");
  });
  it("should pick value itself", () => {
    const mockData = { location: { address: "xxx stress" } };
    expect(pickValue(mockData)).toEqual(mockData);
  });
});
