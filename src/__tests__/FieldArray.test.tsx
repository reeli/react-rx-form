import { mount } from "enzyme";
import * as React from "react";
import { Field } from "../Field";
import { FieldArray } from "../FieldArray";
import { pickInputPropsFromFieldProps } from "../utils";

describe("<FieldArray/>", () => {
  xit("add a field array item", () => {
    const wrapper = createFieldArray();
    const instance = wrapper.children().instance() as any;
    instance.add();
    expect(instance.state).toEqual({ fields: ["members"] });
    wrapper.unmount();
  });

  xit("remove a field array item", () => {
    const wrapper = createFieldArray();
    const instance = wrapper.children().instance() as any;
    console.log(createFieldArray(), "instance");
    instance.add();
    instance.add();
    const mocks = {
      getFormValues: () => jest.fn(),
      updateFormValues: jest.fn(),
    };

    mocks.getFormValues().mockReturnValueOnce({
      members: [{ firstName: "rui" }, { firstName: "li" }],
    });

    instance.remove(0, {
      formContextValue: { ...mocks },
    });
    expect(mocks.getFormValues).toBeCalled();
    expect(mocks.updateFormValues).toBeCalled();
    wrapper.unmount();
  });
});

const createFieldArray = () =>
  mount(
    <FieldArray name={"members"}>
      {({ fields }) =>
        fields.map((member, idx) => (
          <Field name={`${member}.firstName`} key={idx}>
            {(fieldState) => <input type="text" {...pickInputPropsFromFieldProps(fieldState)} />}
          </Field>
        ))
      }
    </FieldArray>,
  );
