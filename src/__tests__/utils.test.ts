import { isEmptyValue, pickInputPropsFromFieldProps } from "../utils";

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
