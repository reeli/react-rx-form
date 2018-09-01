import { mount } from "enzyme";
import * as React from "react";
import { CustomInput } from "../../../src-components/CustomInput";
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
    instance.setFormValues({ firstName: "rui" });
    expect(instance.formState).toEqual({
      firstName: {
        value: "rui",
        meta: {
          error: undefined,
          dirty: false,
        },
      },
    });
  });
});
