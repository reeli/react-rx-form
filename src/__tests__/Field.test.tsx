import { mount } from "enzyme";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { required } from "../../src-modules/utils/validations";
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
      fieldState: {
        meta: {},
      },
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
      fieldState: {
        value: "Jay",
        meta: {},
      },
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
      fieldState: {
        value: "Tony",
        meta: {},
      },
    });
  });
});

describe("#onFormActionChange", () => {
  it("should dispatch field.change action if field contains error when start submit", () => {
    const instance = createForm().ref("field");
    const { mockSub$, mockSubscribeFormAction, mockDispatch } = createMocks();
    instance.props = {
      ...instance.props,
      subscribeFormAction: mockSubscribeFormAction,
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
          firstName: "",
        },
      },
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toBeCalledWith({
      name: "firstName",
      type: "@@rx-form/field/CHANGE",
      meta: {
        dirty: true,
        error: "no empty defaultValue",
      },
      payload: "",
    });
  });

  it("should do nothing if field do not contains error when start submit", () => {
    const instance = createForm().ref("field") as any;
    const { mockSub$, mockSubscribeFormAction, mockDispatch } = createMocks();
    instance.props = {
      ...instance.props,
      subscribeFormAction: mockSubscribeFormAction,
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
  const mockSubscribeFormAction = (observer: any) => {
    mockSub$.subscribe(observer);
  };

  const mockDispatch = jest.fn();

  return {
    mockSub$,
    mockSubscribeFormAction,
    mockDispatch,
  };
};
