import { mount } from "enzyme";
import * as React from "react";
import { CustomInput } from "src-components";
import { Field } from "../Field";
import { RxForm } from "../RxForm";

describe("<RxForm/>", () => {
  it("should correctly set initial values", () => {
    const submit = () => {};
    const wrapper = mount(
      <RxForm>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(submit)}>
            <div>
              <Field name="firstName">
                {(fieldProps) => <CustomInput {...fieldProps} type="text" placeholder="First Name" />}
              </Field>
            </div>
          </form>
        )}
      </RxForm>,
    );

    const instance = wrapper.instance() as any;
    instance.setFormValues({ firstName: "rui", address: [{ street1: "street1" }, { street2: "street2" }] });
    expect(instance.form.values).toEqual({
      firstName: "rui",
      address: [{ street1: "street1" }, { street2: "street2" }],
    });
  });
});
