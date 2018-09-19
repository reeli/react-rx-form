import { mount } from "enzyme";
import * as React from "react";
import { Field } from "../Field";
import { FieldArray } from "../FieldArray";
import { RxForm } from "../RxForm";
import { pickInputPropsFromFieldProps } from "../utils";

describe("<FieldArray/>", () => {
  it("add a field array item", () => {
    const wrapper = createForm();
    const instance = wrapper.ref("fieldArray") as any;
    instance.add();
    const form = wrapper.instance() as RxForm;
    expect(form.getFormValues().members.length).toEqual(2);
    wrapper.unmount();
  });

  it("remove a field array item", () => {
    const wrapper = createForm();
    const instance = wrapper.ref("fieldArray") as any;
    instance.add();
    instance.add();
    const mocks = {
      getFormValues: () => jest.fn(),
      updateFormValues: () => jest.fn(),
    };

    mocks.getFormValues().mockReturnValueOnce({
      members: [{ firstName: "rui" }, { firstName: "li" }],
    });

    instance.remove(0, instance.props);

    const form = wrapper.instance() as RxForm;
    expect(form.getFormValues().members.length).toEqual(2);
    wrapper.unmount();
  });
});

const createForm = () =>
  mount(
    <RxForm
      initialValues={{
        members: [{ firstName: "rui" }],
      }}
    >
      {() => (
        <FieldArray name={"members"} initLength={1} ref={"fieldArray"}>
          {({ fields }) =>
            fields.map((member, idx) => (
              <Field name={`${member}.firstName`} key={idx}>
                {({ value = "", ...others }) => (
                  <input type="text" value={value} {...pickInputPropsFromFieldProps(others)} />
                )}
              </Field>
            ))
          }
        </FieldArray>
      )}
    </RxForm>,
  );
