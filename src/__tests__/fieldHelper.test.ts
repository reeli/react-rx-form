import { maxLength5, required } from "../../src-modules/utils/validations";
import { combineValidators, isFieldDirty, pickValue, validateField } from "../fieldHelper";

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

describe("#isFieldDirty", () => {
  it("should return false if current value is equal original value", () => {
    expect(isFieldDirty("test", "test")).toBe(false);
  });

  it("should return true if current value is not equal original value", () => {
    expect(isFieldDirty("test", "test123")).toBe(true);
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
