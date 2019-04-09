import { mount } from "enzyme";
import * as React from "react";
import { CustomInput } from "src-components";
import { Field } from "../Field";
import { FormValues } from "../FormValues";
import { RxForm } from "../RxForm";

describe("<FormValues/>", () => {
  it("should get form values through this component", () => {
    const submit = () => {};
    const wrapper = mount(
      <RxForm>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(submit)}>
            <div>
              <FormValues>
                {({ formValues }) => {
                  return (
                    <>
                      <Field name="firstName">
                        {(fieldProps) => <CustomInput {...fieldProps} type="text" placeholder="First Name" />}
                      </Field>
                      {!!formValues.firstName && (
                        <Field name="lastName">
                          {(fieldProps) => <CustomInput {...fieldProps} type="text" placeholder="Last Name" />}
                        </Field>
                      )}
                    </>
                  );
                }}
              </FormValues>
              <Field name="age">{(fieldProps) => <CustomInput {...fieldProps} type="text" placeholder="Age" />}</Field>
            </div>
          </form>
        )}
      </RxForm>,
    );

    const firstNameInput = wrapper.find("input[name='firstName']");
    firstNameInput.simulate("change", { target: { value: "123" } });

    const lastNameInput = wrapper.find("input[name='lastName']");
    expect(lastNameInput.length).toEqual(1);
  });
});
