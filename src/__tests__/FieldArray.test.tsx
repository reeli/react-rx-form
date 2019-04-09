import { mount } from "enzyme";
import * as React from "react";
import { Field } from "../Field";
import { FieldArray } from "../FieldArray";
import { RxForm } from "../RxForm";
import { pickInputPropsFromFieldProps } from "../utils";

describe("<FieldArray/>", () => {
  it("expected to render the field array items based on `initLength`", () => {
    const wrapper = createForm(3);
    expect(wrapper.find("input").length).toBe(3);
    wrapper.unmount();
  });

  it("when click add button, expect a field array item added", () => {
    const wrapper = createForm();
    wrapper.find(".add").simulate("click");
    expect(wrapper.find("input").length).toBe(2);
    wrapper.unmount();
  });

  it("when click remove button, expected a field array item removed", () => {
    const wrapper = createForm();

    wrapper
      .find(".remove")
      .first()
      .simulate("click");

    expect(wrapper.find("input").length).toEqual(0);
    wrapper.unmount();
  });

  it("when drop the first item, expect other field array items exists with the correct value", () => {
    const wrapper = createForm();

    const addBtn = wrapper.find(".add");
    addBtn.simulate("click");
    addBtn.simulate("click");

    wrapper
      .find("input")
      .last()
      .simulate("change", { target: { value: "funny" } });

    wrapper
      .find(".remove")
      .first()
      .simulate("click");

    expect(wrapper.find("input").length).toEqual(2);
    expect(
      wrapper
        .find("input")
        .last()
        .props().value,
    ).toEqual("funny");

    wrapper.unmount();
  });
});

const createForm = (initLength: number = 1) =>
  mount(
    <RxForm
      initialValues={{
        members: [{ firstName: "rui" }],
      }}
    >
      {() => (
        <FieldArray name={"members"} initLength={initLength}>
          {({ fields, add, remove }) => {
            return (
              <>
                {fields.map((itemPrefix, idx) => (
                  <Field name={`${itemPrefix}.firstName`} key={idx}>
                    {({ value = "", ...others }) => {
                      return (
                        <div>
                          <input type="text" value={value} {...pickInputPropsFromFieldProps(others)} />
                          <button onClick={() => remove(idx)} className={"remove"}>
                            Remove
                          </button>
                        </div>
                      );
                    }}
                  </Field>
                ))}
                <button onClick={add} className={"add"}>
                  Add
                </button>
              </>
            );
          }}
        </FieldArray>
      )}
    </RxForm>,
  );
