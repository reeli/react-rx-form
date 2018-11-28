import { mount } from "enzyme";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { maxLength5, required } from "../../src-modules/utils/validations";
import { Field } from "../Field";
import { FormActionTypes } from "../interfaces";
import { RxForm } from "../RxForm";
import { pickInputPropsFromFieldProps } from "../utils";

describe("should have correct initial state", () => {
  it("should have initial empty fieldState", () => {
    const wrapper = mount(
      <Field name={"firstName"}>
        {(fieldState) => <input type="text" {...pickInputPropsFromFieldProps(fieldState)} />}
      </Field>,
    );

    const instance = wrapper.children().instance() as any;
    expect(instance.state).toEqual({
      meta: {},
    });
  });

  it("should set field value by initial form values in priority", () => {
    const wrapper = mount(
      <RxForm initialValues={{ firstName: "Jay" }}>
        {() => (
          <Field name={"firstName"} defaultValue={"Tony"} ref={"field"}>
            {(fieldState) => <input type="text" {...pickInputPropsFromFieldProps(fieldState)} />}
          </Field>
        )}
      </RxForm>,
    );
    const instance = wrapper.ref("field") as any;
    expect(instance.state).toEqual({
      value: "Jay",
      meta: {},
    });
  });

  it("should set field value by defaultValue prop if not have initialValues", () => {
    const wrapper = mount(
      <Field name={"firstName"} defaultValue={"Tony"}>
        {(fieldState) => <input type="text" {...pickInputPropsFromFieldProps(fieldState)} />}
      </Field>,
    );
    const instance = wrapper.children().instance() as any;
    expect(instance.state).toEqual({
      value: "Tony",
      meta: {},
    });
  });
});

describe("when field change", () => {
  it("should only update current field, not update other fields", () => {
    const wrapper = mount(
      <RxForm initialValues={{}}>
        {() => (
          <>
            <Field name={"firstName"} defaultValue={"Tony"} ref={"field1"} validate={required()}>
              {(fieldState) => (
                <input className={"firstName"} type="text" {...pickInputPropsFromFieldProps(fieldState)} />
              )}
            </Field>
            <Field name={"lastName"} ref={"field2"} validate={required()}>
              {(fieldState) => <input type="text" {...pickInputPropsFromFieldProps(fieldState)} />}
            </Field>
          </>
        )}
      </RxForm>,
    );

    const field1 = wrapper.ref("field1") as any;
    const field2 = wrapper.ref("field2") as any;
    field1.render = jest.fn();
    field2.render = jest.fn();

    wrapper.find(".firstName").simulate("change", { target: { value: "haha" } });
    expect(field1.render).toHaveBeenCalledTimes(1);
    expect(field2.render).toHaveBeenCalledTimes(0);
  });
});

xdescribe("field validation", () => {
  it("should remove error when field from invalid to valid", () => {
    const wrapper = mount(
      <RxForm initialValues={{}}>
        {() => (
          <>
            <Field name={"firstName"} defaultValue={"Tony"} ref={"field1"} validate={[required(), maxLength5()]}>
              {(fieldState) => (
                <div>
                  <input className={"firstName"} type="text" {...pickInputPropsFromFieldProps(fieldState)} />
                  {fieldState.meta.error && <span className={"error"}>error</span>}
                </div>
              )}
            </Field>
          </>
        )}
      </RxForm>,
    );
    wrapper.find(".firstName").simulate("change", { target: { value: "hahhaaha" } });
    wrapper.find(".firstName").simulate("change", { target: { value: "ha" } });
    expect(wrapper.find(".error").exists()).toBe(false);
  });
});

describe("#onFormActionChange", () => {
  it("should dispatch field.change action if field contains error when start submit", () => {
    const instance = createForm().ref("field");
    const { mockSub$, mockSubscribe, mockDispatch } = createMocks();
    instance.props = {
      ...instance.props,
      subscribeFormAction: mockSubscribe,
      dispatch: mockDispatch,
    };
    instance.onFormActionChange();

    const mockFormState = {
      fields: {
        firstName: {
          focused: true,
        },
      },
      values: {
        firstName: "",
      },
    };

    mockSub$.next({
      type: FormActionTypes.startSubmit,
      payload: mockFormState,
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toBeCalledWith({
      name: "firstName",
      type: "@@rx-form/field/CHANGE",
      meta: {
        dirty: true,
        focused: true,
        error: "no empty defaultValue",
      },
      payload: "",
    });
  });

  it("should do nothing if field do not contains error when start submit", () => {
    const instance = createForm().ref("field") as any;
    const { mockSub$, mockSubscribe, mockDispatch } = createMocks();
    instance.props = {
      ...instance.props,
      subscribeFormAction: mockSubscribe,
      dispatch: mockDispatch,
    };
    instance.onFormActionChange();

    mockSub$.next({
      type: FormActionTypes.startSubmit,
      payload: {
        fields: {
          firstName: {
            name: "firstName",
            meta: {},
          },
        },
        values: {
          firstName: "Rui",
        },
      },
    });

    expect(mockDispatch).toHaveBeenCalledTimes(0);
  });
});

describe("#onFormStateChange", () => {
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
      <RxForm initialValues={{}}>
        {() => (
          <Field name={"firstName"} ref={"field"} validate={required()}>
            {(fieldState) => <input type="text" {...pickInputPropsFromFieldProps(fieldState)} />}
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

describe("#onFocus", () => {
  it("should dispatch field focus action with correct params", () => {
    const instance = createForm().ref("field");
    const { mockDispatch } = createMocks();
    instance.props = {
      ...instance.props,
      dispatch: mockDispatch,
    };
    instance.onFocus();
    expect(mockDispatch).toHaveBeenCalledWith({
      name: "firstName",
      type: "@@rx-form/field/FOCUS",
      meta: {
        visited: true,
      },
    });
  });
});

describe("#onBlur", () => {
  it("should dispatch field blur action with correct params", () => {
    const instance = createForm().ref("field");
    const { mockDispatch } = createMocks();
    instance.props = {
      ...instance.props,
      dispatch: mockDispatch,
    };
    instance.onBlur();
    expect(mockDispatch).toHaveBeenCalledWith({
      name: "firstName",
      type: "@@rx-form/field/BLUR",
      meta: {
        touched: true,
      },
    });
  });
});

describe("#registerField", () => {
  it("should call dispatch with correct params", () => {
    const instance = createForm().ref("field");
    const { mockDispatch } = createMocks();
    instance.props = {
      ...instance.props,
      dispatch: mockDispatch,
    };

    instance.registerField({
      value: "Rui",
      meta: {
        dirty: false,
      },
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      name: "firstName",
      type: "@@rx-form/field/REGISTER_FIELD",
      meta: {
        dirty: false,
      },
      payload: "Rui",
    });
  });
});

describe("#format", () => {
  it("should format value for field input", () => {
    const wrapper = mount(
      <Field
        name={"firstName"}
        defaultValue={"Tony"}
        validate={required()}
        format={(value) => (value ? `${value}.` : value)}
      >
        {(fieldState) => <input type="text" {...pickInputPropsFromFieldProps(fieldState)} />}
      </Field>,
    );
    expect(wrapper.find("input").prop("value")).toEqual("Tony.");
  });
});

describe("#parse", () => {
  it("should parse value before store it to form", () => {
    const wrapper = mount(
      <RxForm initialValues={{}}>
        {() => (
          <Field
            name={"firstName"}
            defaultValue={"Tony"}
            ref={"field"}
            validate={required()}
            format={(value) => (value ? `${value}.` : value)}
            parse={(value) => (value ? value.replace(/\./g, "") : value)}
          >
            {(fieldState) => (
              <input
                type="text"
                {...pickInputPropsFromFieldProps(fieldState)}
                onChange={(evt) => {
                  fieldState.onChange(evt.target.value);
                }}
              />
            )}
          </Field>
        )}
      </RxForm>,
    );
    const formInstance = wrapper.instance() as any;
    wrapper.find("input").simulate("change", { target: { value: "TonyRui." } });
    expect(formInstance.formState).toEqual({
      fields: {
        firstName: {
          dirty: true,
        },
      },
      values: {
        firstName: "TonyRui",
      },
    });
  });
});

const createForm: any = () =>
  mount(
    <RxForm initialValues={{}}>
      {() => (
        <Field name={"firstName"} defaultValue={"Tony"} ref={"field"} validate={required()}>
          {(fieldState) => <input type="text" {...pickInputPropsFromFieldProps(fieldState)} />}
        </Field>
      )}
    </RxForm>,
  );

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
