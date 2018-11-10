import { mount } from "enzyme";
import * as React from "react";
import { CustomInput } from "src-components";
import { Field } from "../Field";
import { FieldArray } from "../FieldArray";
import { FormSection } from "../FormSection";
import { RxForm } from "../RxForm";

describe("<FormSection/>", () => {
  it("should pass correct name prefix to input", () => {
    const submit = () => {};
    const wrapper = mount(
      <RxForm>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(submit)}>
            <div>
              <FormSection name={"user"}>
                <div>
                  <Field name="firstName">
                    {(fieldProps) => <CustomInput {...fieldProps} type="text" placeholder="First Name" />}
                  </Field>
                </div>
              </FormSection>
            </div>
          </form>
        )}
      </RxForm>,
    );

    const input = wrapper.find("input");
    expect(input.props().name).toEqual("user.firstName");
  });

  it("should work with FieldArray", () => {
    const submit = () => {};
    const wrapper = mount(
      <RxForm>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(submit)}>
            <div>
              <FormSection name={"user"}>
                <div>
                  <FieldArray name={"address"} initLength={1}>
                    {({ each }) =>
                      each((prefix, idx) => (
                        <Field name={`${prefix}.firstName`} key={idx}>
                          {(fieldProps) => <CustomInput {...fieldProps} type="text" placeholder="First Name" />}
                        </Field>
                      ))
                    }
                  </FieldArray>
                </div>
              </FormSection>
            </div>
          </form>
        )}
      </RxForm>,
    );

    const input = wrapper.find("input");
    expect(input.props().name).toEqual("user.address[0].firstName");
  });
});
