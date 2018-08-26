import { mount } from "enzyme";
import * as React from "react";
import { Field } from "../Field";
import { pickInputPropsFromFieldProps } from "../utils";

describe("<Field/>", () => {
  it("should have correct initial state", () => {
    const wrapper = mount(
      <Field name={"firstName"}>
        {(fieldState) => <input type="text" {...pickInputPropsFromFieldProps(fieldState)} />}
      </Field>,
    );

    const instance = wrapper.children().instance() as any;
    expect(instance.state).toEqual({
      fieldState: {
        name: "firstName",
        value: undefined,
        meta: {
          error: undefined,
          dirty: false,
        },
      },
    });
  });
});
