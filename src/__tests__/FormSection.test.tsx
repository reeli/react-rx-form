import { mount } from "enzyme";
import * as React from "react";
import { CustomInput } from "src-components";
import { Field } from "../Field";
import { FieldArray } from "../FieldArray";
import { FormSection } from "../FormSection";
import { RxForm } from "../RxForm";
import { pickDOMAttrs } from "../utils";

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

  it("Expected to have correct form values and form state when submit form with nested FormSection", () => {
    const mockSubmit = jest.fn();

    const wrapper = mount(
      <RxForm>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(mockSubmit)}>
            <FormSection name={"user1"}>
              <Field name={"firstName"}>
                {({ value = "", ...otherProps }) => (
                  <input
                    {...pickDOMAttrs(otherProps)}
                    value={value}
                    type="text"
                    placeholder="First Name"
                    className={"user1-firstName"}
                  />
                )}
              </Field>
              <FormSection name={"user2"}>
                <Field name={"firstName"}>
                  {({ value = "", ...otherProps }) => (
                    <input
                      {...pickDOMAttrs(otherProps)}
                      value={value}
                      type="text"
                      placeholder="First Name"
                      className={"user2-firstName"}
                    />
                  )}
                </Field>
              </FormSection>
              <button type={"submit"}>submit</button>
            </FormSection>
          </form>
        )}
      </RxForm>,
    );

    wrapper.find(".user1-firstName").simulate("change", { target: { value: "Test1" } });
    wrapper.find(".user2-firstName").simulate("change", { target: { value: "Test2" } });
    wrapper.find("button").simulate("submit");

    expect(mockSubmit).toBeCalledTimes(1);

    const firstArg = mockSubmit.mock.calls[0][0];
    expect(firstArg).toEqual({
      user1: {
        firstName: "Test1",
        user2: {
          firstName: "Test2",
        },
      },
    });
  });
});
