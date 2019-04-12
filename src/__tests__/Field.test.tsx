import { mount } from "enzyme";
import * as React from "react";
import { IFieldInnerProps, IFieldMeta } from "src/__types__/interfaces";
import { maxLength5, required } from "../../guide/utils/validations";
import { Field } from "../Field";
import { FormValues } from "../FormValues";
import { RxForm } from "../RxForm";

describe("field initial", () => {
  it("should have correct initial state", () => {
    const wrapper = mount(
      <Field name={"firstName"}>{(fieldState) => <MockInput {...pickInputPropsFromFieldProps(fieldState)} />}</Field>,
    );
    expect(wrapper.find(MockInput).props().error).toBe(undefined);
    wrapper.unmount();
  });

  it("when pass default value, expected set as field value", () => {
    const wrapper = mount(
      <Field name={"firstName"} defaultValue={"Tony"}>
        {(fieldState) => (
          <input type="text" name={fieldState.name} value={fieldState.value} onChange={fieldState.onChange} />
        )}
      </Field>,
    );

    expect(wrapper.find("input").props().value).toEqual("Tony");
    wrapper.unmount();
  });

  it("when passed initial form values, expected to set field value as defaultValue", () => {
    const wrapper = mount(
      <RxForm initialValues={{ firstName: "Jay" }}>
        {() => (
          <Field name={"firstName"}>
            {(fieldState) => (
              <input type="text" name={fieldState.name} value={fieldState.value} onChange={fieldState.onChange} />
            )}
          </Field>
        )}
      </RxForm>,
    );

    expect(wrapper.find("input").props().value).toEqual("Jay");
    wrapper.unmount();
  });

  it("when both have initial values and default value, expected to use initial form values in priority", () => {
    const wrapper = mount(
      <RxForm initialValues={{ firstName: "Jay" }}>
        {() => (
          <Field name={"firstName"} defaultValue={"Tony"}>
            {(fieldState) => (
              <input type="text" name={fieldState.name} value={fieldState.value} onChange={fieldState.onChange} />
            )}
          </Field>
        )}
      </RxForm>,
    );

    expect(wrapper.find("input").props().value).toEqual("Jay");
    wrapper.unmount();
  });
});

describe("field change", () => {
  it("should only current field updated, the other fields has not updated", () => {
    const wrapper = mount(
      <RxForm>
        {() => (
          <>
            <Field name={"firstName"} defaultValue={"Tony"} validate={required()}>
              {(fieldState) => (
                <input
                  className={"firstName"}
                  type="text"
                  name={fieldState.name}
                  value={fieldState.value}
                  onChange={fieldState.onChange}
                />
              )}
            </Field>
            <Field name={"lastName"} validate={required()}>
              {(fieldState) => (
                <input
                  type="text"
                  className={"lastName"}
                  name={fieldState.name}
                  value={fieldState.value}
                  onChange={fieldState.onChange}
                />
              )}
            </Field>
          </>
        )}
      </RxForm>,
    );

    wrapper.find(".firstName").simulate("change", { target: { value: "Ping" } });

    expect(wrapper.find(".firstName").props().value).toEqual("Ping");
    expect(wrapper.find(".lastName").props().value).toBe(undefined);
  });

  it("when field change, expect to set `dirty` prop", () => {
    const wrapper = createForm();
    const inputEle = wrapper.find("input");
    inputEle.simulate("change", { target: { value: "Ping" } });
    expect(wrapper.find(MockInput).props().dirty).toBe(true);
  });

  it("when field change, expected to get correct input value", () => {
    const wrapper = createForm();
    const inputEle = wrapper.find("input");
    inputEle.simulate("change", { target: { value: "Pin" } });
    inputEle.simulate("change", { target: { value: "Ping" } });

    expect(wrapper.find(MockInput).props().value).toEqual("Ping");
  });
});

describe("field validation", () => {
  it("when field value is invalid, expected field error set", () => {
    const wrapper = mount(
      <RxForm>
        {() => (
          <>
            <Field name={"firstName"} defaultValue={"Tony"} validate={[required(), maxLength5()]}>
              {(fieldState) => (
                <div>
                  <input
                    className={"firstName"}
                    type="text"
                    name={fieldState.name}
                    value={fieldState.value}
                    onChange={fieldState.onChange}
                  />
                  {fieldState.meta.error && <span className={"error"}>error</span>}
                </div>
              )}
            </Field>
          </>
        )}
      </RxForm>,
    );

    wrapper.find(".firstName").simulate("change", { target: { value: "PingPong" } });
    expect(wrapper.find(".error").exists()).toBe(true);
  });

  it("when field changed from invalid to valid, expected error no exists", () => {
    const wrapper = mount(
      <RxForm>
        {() => (
          <>
            <Field name={"firstName"} defaultValue={"Tony"} validate={[required(), maxLength5()]}>
              {(fieldState) => (
                <div>
                  <input
                    className={"firstName"}
                    type="text"
                    name={fieldState.name}
                    value={fieldState.value}
                    onChange={fieldState.onChange}
                  />
                  {fieldState.meta.error && <span className={"error"}>error</span>}
                </div>
              )}
            </Field>
          </>
        )}
      </RxForm>,
    );

    wrapper.find(".firstName").simulate("change", { target: { value: "PingPing" } });
    wrapper.find(".firstName").simulate("change", { target: { value: "Pong" } });

    expect(wrapper.find(".error").exists()).toBe(false);
  });
});

describe("form submit", () => {
  const mockSubmit = jest.fn();

  const renderForm = (defaultValue: string) =>
    mount(
      <RxForm>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(mockSubmit)}>
            <Field name={"firstName"} validate={required()} defaultValue={defaultValue}>
              {(fieldState) => <MockInput type="text" {...pickInputPropsFromFieldProps(fieldState)} />}
            </Field>
            <button type={"submit"}>submit</button>
          </form>
        )}
      </RxForm>,
    );

  it("when any of the field invalid, expected form submit failed and set correct error to field", () => {
    const wrapper = renderForm("");
    wrapper.find("button").simulate("submit");

    expect(mockSubmit).not.toBeCalled();
    expect(wrapper.find(MockInput).props().error).toEqual("no empty defaultValue");
    wrapper.unmount();
  });

  it("when all fields valid, expected form submit succeed with correct form values", () => {
    const wrapper = renderForm("funny");
    wrapper.find("input").simulate("change", { target: { value: "Test1" } });
    wrapper.find("button").simulate("submit");

    const firstArg = mockSubmit.mock.calls[0][0];
    expect(firstArg).toEqual({
      firstName: "Test1",
    });
    expect(mockSubmit).toBeCalledTimes(1);

    wrapper.unmount();
  });

  it("when form submit, expected field visited and touched", () => {
    const wrapper = renderForm("");
    wrapper.find("button").simulate("submit");

    const fieldProps = wrapper.find(MockInput).props();

    expect(fieldProps.visited).toBe(true);
    expect(fieldProps.touched).toBe(true);
    expect(fieldProps.dirty).toBe(false);
  });
});

describe("field blur", () => {
  it("when input blur, expected `touched` prop to equal true", () => {
    const wrapper = createForm();
    const inputEle = wrapper.find("input");
    inputEle.simulate("blur");
    expect(wrapper.find(MockInput).props().touched).toBe(true);
  });
});

describe("field focus", () => {
  it("when focus on input, expected `visited` props to equal true", () => {
    const wrapper = createForm();
    const inputEle = wrapper.find("input");
    inputEle.simulate("focus");
    expect(wrapper.find(MockInput).props().visited).toBe(true);
  });
});

describe("transform field value", () => {
  const renderForm = (props: any) => {
    return mount(
      <RxForm>
        {() => (
          <FormValues>
            {({ formValues }) => (
              <div>
                <Field name={"firstName"} defaultValue={"Tony"} validate={required()} {...props}>
                  {({ meta, ...others }) => <input {...others} />}
                </Field>
                <div className={"storedFirstName"}>{formValues.firstName}</div>
              </div>
            )}
          </FormValues>
        )}
      </RxForm>,
    );
  };

  it("should format field value for input", () => {
    const wrapper = renderForm({
      format: (value: any) => (value ? `${value}.` : value),
    });
    expect(wrapper.find("input").prop("value")).toEqual("Tony.");
  });

  it("should parse value before store it to form", () => {
    const wrapper = renderForm({
      format: (value: string) => (value ? `${value}.` : value),
      parse: (value: string) => (value ? value.replace(/\./g, "") : value),
    });

    wrapper.find("input").simulate("change", { target: { value: "TonyDong." } });
    expect(wrapper.find(".storedFirstName").text()).toEqual("TonyDong");
  });

  it("should normalize field value", () => {
    const wrapper = renderForm({
      normalize: lower,
    });

    wrapper.find("input").simulate("change", { target: { value: "Tony Dong" } });
    expect(wrapper.find("input").prop("value")).toEqual("tony dong");
  });

  it("when both use format/parse and normalize, expected field value be transformed correctly", () => {
    const wrapper = renderForm({
      format: (value: string) => (value ? `${value}.` : value),
      parse: (value: string) => (value ? value.replace(/\./g, "") : value),
      normalize: lower,
    });

    wrapper.find("input").simulate("change", { target: { value: "Tony Dong." } });

    expect(wrapper.find("input").prop("value")).toEqual("tony dong.");
    expect(wrapper.find(".storedFirstName").text()).toEqual("tony dong");
  });
});

const MockInput = ({ label, error, touched, visited, dirty, ...others }: any) => {
  return (
    <>
      <label>{label}</label>
      <input type="text" {...others} />
      {error && <div className={"error"}>{error}</div>}
    </>
  );
};

const createForm: any = (otherProps: any = {}) =>
  mount(
    <RxForm>
      {() => (
        <Field name={"firstName"} defaultValue={"Tony"} validate={required()} {...otherProps}>
          {(fieldState) => <MockInput type="text" {...pickInputPropsFromFieldProps(fieldState)} />}
        </Field>
      )}
    </RxForm>,
  );

const pickInputPropsFromFieldProps = <T extends { meta: IFieldMeta } = IFieldInnerProps>({ meta, ...others }: T) => {
  return {
    ...others,
    ...(meta || {}),
  };
};

const lower = (value: string) => value && value.toLowerCase();
