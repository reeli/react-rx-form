import { mount } from "enzyme";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { IFieldInnerProps, IFieldMeta } from "src/__types__/interfaces";
import { maxLength5, required } from "../../src-modules/utils/validations";
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

  it("when all fields valid, expected form submit succeed", () => {
    const wrapper = renderForm("funny");
    wrapper.find("button").simulate("submit");
    expect(mockSubmit).toBeCalledTimes(1);
    wrapper.unmount();
  });

  it("when form submit, expected field visited and touched", () => {
    const wrapper = renderForm("");
    wrapper.find("button").simulate("submit");

    const fieldProps = wrapper.find(MockInput).props();

    expect(fieldProps.visited).toBe(true);
    expect(fieldProps.touched).toBe(true);
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

describe("format and parse field value", () => {
  it("should format value for field input", () => {
    const wrapper = mount(
      <Field
        name={"firstName"}
        defaultValue={"Tony"}
        validate={required()}
        format={(value) => (value ? `${value}.` : value)}
      >
        {(fieldState) => (
          <input type="text" name={fieldState.name} value={fieldState.value} onChange={fieldState.onChange} />
        )}
      </Field>,
    );
    expect(wrapper.find("input").prop("value")).toEqual("Tony.");
  });

  it("should parse value before store it to form", () => {
    const wrapper = mount(
      <RxForm>
        {() => (
          <FormValues>
            {({ formValues }) => (
              <div>
                <Field
                  name={"firstName"}
                  defaultValue={"Tony"}
                  validate={required()}
                  format={(value) => (value ? `${value}.` : value)}
                  parse={(value) => (value ? value.replace(/\./g, "") : value)}
                >
                  {(fieldState) => (
                    <input
                      type="text"
                      name={fieldState.name}
                      value={fieldState.value}
                      onChange={(evt) => {
                        fieldState.onChange(evt.target.value);
                      }}
                    />
                  )}
                </Field>
                <div className={"storedFirstName"}>{formValues.firstName}</div>
              </div>
            )}
          </FormValues>
        )}
      </RxForm>,
    );

    wrapper.find("input").simulate("change", { target: { value: "TonyDong." } });
    expect(wrapper.find(".storedFirstName").text()).toEqual("TonyDong");
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

const createForm: any = () =>
  mount(
    <RxForm>
      {() => (
        <Field name={"firstName"} defaultValue={"Tony"} validate={required()}>
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

xdescribe("#onFormStateChange", () => {
  it("should call setState when field state changed", () => {
    const instance = createForm().ref("field");
    const { mockSub$, mockSubscribe, mockDispatch } = createMocks();
    instance.props = {
      ...instance.props,
      subscribe: mockSubscribe,
      dispatch: mockDispatch,
    };
    const mockSetState = jest.fn();
    instance.setState = mockSetState;
    instance.onFormStateChange();

    mockSub$.next({
      fields: {
        firstName: {
          dirty: true,
        },
      },
      values: {
        firstName: "ru",
      },
    });

    mockSub$.next({
      fields: {
        firstName: {
          dirty: true,
        },
      },
      values: {
        firstName: "rui",
      },
    });

    expect(instance.setState).lastCalledWith({
      meta: {
        dirty: true,
      },
      value: "rui",
    });
  });

  it("should not call setState when field state not change", () => {
    const wrapper = mount(
      <RxForm>
        {() => (
          <Field name={"firstName"} validate={required()}>
            {(fieldState) => (
              <input type="text" name={fieldState.name} value={fieldState.value} onChange={fieldState.onChange} />
            )}
          </Field>
        )}
      </RxForm>,
    ) as any;

    const instance = wrapper.ref("field");
    const { mockSub$, mockSubscribe, mockDispatch } = createMocks();
    instance.props = {
      ...instance.props,
      subscribe: mockSubscribe,
      dispatch: mockDispatch,
    };
    const mockSetState = jest.fn();
    instance.setState = mockSetState;
    instance.onFormStateChange();

    mockSub$.next({
      fields: {
        lastName: {
          dirty: true,
        },
      },
      values: {
        lastName: "rui",
      },
    });

    expect(instance.setState).not.toHaveBeenCalled();
  });
});

const createMocks = () => {
  const mockSub$ = new Subject();
  const mockSubscribe = (observer: any) => {
    mockSub$.subscribe(observer);
  };

  const mockDispatch = jest.fn();

  return {
    mockSub$,
    mockSubscribe,
    mockDispatch,
  };
};
