import { cloneDeep, omit, set } from "lodash";
import React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Observer } from "rxjs/internal/types";
import {
  FieldActionTypes,
  FormActionTypes,
  IFieldAction,
  IFieldMeta,
  IFormAction,
  IFormState,
  IFormValues,
  TChildrenRender,
  TErrors,
  TOnSubmit,
} from "./__types__/interfaces";
import { FormProvider } from "./FormContext";

import { isContainError, log, setErrors, setFieldsError, setFieldsMeta } from "./utils";
import { WithDidMount } from "./WithDidMount";

interface IRxFormInnerProps {
  handleSubmit: (onSubmit: TOnSubmit) => (formEvent: React.FormEvent) => any;
}

interface IRxFormProps {
  children: TChildrenRender<IRxFormInnerProps>;
  initialValues?: IFormValues;
}

export function RxForm(props: IRxFormProps) {
  let formState = {
    fields: {},
    values: cloneDeep(props.initialValues) || {},
  } as IFormState;
  const formStateSubject$ = new Subject();
  const formActionSubject$ = new Subject();

  const updateFormValues = (formValues: IFormValues) => {
    formState = {
      fields: formState.fields,
      values: formValues,
    };
  };

  const updateField = (state: IFormState, action: IFieldAction) => {
    const { fields, values } = state;
    const { payload, meta = {} as IFieldMeta, name } = action;
    return {
      fields: {
        ...fields,
        [name]: {
          ...fields[name],
          ...meta,
        },
      },
      values: set<IFormValues>({ ...values }, name, payload), // Notice: _.set will mutate object,
    };
  };

  const updateFieldState = (state: IFormState, action: IFieldAction) => {
    const { fields, values } = state;
    const { name, meta } = action;
    return {
      values,
      fields: {
        ...fields,
        [name]: {
          ...meta,
        },
      },
    };
  };

  const onSubmitError = (errors: TErrors) => {
    // TODO: Check if if values should be different if fields contains error

    formState = {
      values: formState.values,
      fields: setErrors(formState.fields, errors),
    };

    formStateSubject$.next(formState);
  };

  const setFormErrors = (errors: TErrors) => {
    formState = {
      values: formState.values,
      fields: setFieldsError(errors, formState.fields),
    };
    formStateSubject$.next(formState);
  };

  const notifyFormActionChange = (action: IFormAction) => {
    formActionSubject$.next(action);
  };

  const getFormValues = () => {
    return formState.values;
  };

  const getFormState = () => {
    return formState;
  };

  const removeField = (state: IFormState, action: IFieldAction) => {
    if (action.meta && action.meta.destroyValueOnUnmount) {
      return {
        fields: omit(state.fields, action.name),
        values: omit(state.values, action.name),
      };
    }

    // keep values when field destroy for cross page form
    // eg: in PageA, switch to PageB, should keep PageA fields values.
    return {
      ...state,
      fields: omit(state.fields, action.name),
    };
  };

  const dispatch = (action: IFieldAction | IFormAction) => {
    const prevState = (process.env.NODE_ENV === "development" ? cloneDeep : (v: IFormState) => v)(formState);

    switch (action.type) {
      case FieldActionTypes.register:
      case FieldActionTypes.blur:
      case FieldActionTypes.change: {
        formState = updateField(formState, action as IFieldAction);
        formStateSubject$.next(formState);
        break;
      }
      case FieldActionTypes.focus: {
        formState = updateFieldState(formState, action as IFieldAction);
        formStateSubject$.next(formState);
        break;
      }
      case FieldActionTypes.destroy: {
        formState = removeField(formState, action as IFieldAction);
        formStateSubject$.next(formState);
        break;
      }
      case FormActionTypes.startSubmit: {
        notifyFormActionChange(action as IFormAction);
        break;
      }
    }

    const nextState = (process.env.NODE_ENV === "development" ? cloneDeep : (v: IFormState) => v)(formState);

    log({
      action,
      prevState,
      nextState,
    });
  };

  const subscribe = (observer: Observer<any>) => {
    return formStateSubject$.subscribe(observer);
  };

  const subscribeFormAction = (observer: Observer<any>) => {
    return formActionSubject$.subscribe(observer);
  };

  const updateFormState = (state: IFormState) => {
    formStateSubject$.next(state);
  };

  const handleSubmit = (onSubmit: TOnSubmit) => {
    return (evt: React.FormEvent) => {
      evt.preventDefault();

      formState = {
        fields: setFieldsMeta(formState.fields),
        values: formState.values,
      };

      updateFormState(formState);

      dispatch({
        type: FormActionTypes.startSubmit,
        payload: formState,
      });

      if (isContainError(formState.fields)) {
        return;
      }

      const values = getFormValues();
      if (values) {
        onSubmit(values, onSubmitError);
      }
    };
  };

  const notifyFormState = () => {
    formStateSubject$.next(formState);
  };

  return (
    <FormProvider
      value={{
        subscribe,
        dispatch,
        subscribeFormAction,
        updateFormValues,
        getFormValues,
        getFormState,
        setErrors: setFormErrors,
      }}
    >
      <WithDidMount onDidMount={notifyFormState} />
      {props.children({
        handleSubmit,
      })}
    </FormProvider>
  );
}
