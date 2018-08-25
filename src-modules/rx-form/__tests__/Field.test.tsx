import { mount } from "enzyme";
import * as React from "react";
import { Field } from "../Field";
import { pickInputPropsFromFieldProps } from "../utils";

describe("<Field/>", () => {
  const wrapper = mount(
    <Field name={"firstName"}>
      {(fieldState) => <input type="text" {...pickInputPropsFromFieldProps(fieldState)} />}
    </Field>,
  );

  const instance = wrapper.children().instance() as any;

  it("isDirty should be false if current value is equal original value", () => {
    expect(instance.isDirty("test", "test")).toBe(false);
  });

  it("isDirty should be true if current value is not equal original value", () => {
    expect(instance.isDirty("test", "test123")).toBe(true);
  });
});
