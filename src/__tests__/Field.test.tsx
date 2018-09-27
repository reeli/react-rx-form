import { mount } from "enzyme";
import * as React from "react";
import { Field } from "../Field";
import { RxForm } from "../RxForm";
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
        value: undefined,
        meta: {
          error: undefined,
          dirty: false,
        },
      },
    });
  });

  it("should set field value by initial form values in priority", () => {
    const wrapper = mount(
      <RxForm initialValues={{ firstName: "Jay" }}>
        {() => (
          <Field name={"firstName"} defaultValue={"Tony"} ref={"field"}>
            {(fieldState) => <input type="text" {...pickInputPropsFromFieldProps(fieldState)} />}
          </Field>
        )}
      </RxForm>,
    );
    const instance = wrapper.ref("field") as any;
    expect(instance.state).toEqual({
      fieldState: {
        value: "Jay",
        meta: {
          error: undefined,
          dirty: false,
        },
      },
    });
  });

  it("should set field value by defaultValue prop if not have initialValues", () => {
    const wrapper = mount(
      <Field name={"firstName"} defaultValue={"Tony"}>
        {(fieldState) => <input type="text" {...pickInputPropsFromFieldProps(fieldState)} />}
      </Field>,
    );
    const instance = wrapper.children().instance() as any;
    expect(instance.state).toEqual({
      fieldState: {
        value: "Tony",
        meta: {
          error: undefined,
          dirty: false,
        },
      },
    });
  });
});
