import { cloneDeep } from "lodash";
import React, { useMemo } from "react";
import { BehaviorSubject, Subject } from "rxjs";
import { Observer } from "rxjs/internal/types";
import {
  FieldActionTypes,
  FormActionTypes,
  IFieldAction,
  IFormAction,
  IFormState,
  IFormValues,
  TChildrenRender,
  TErrors,
  TOnSubmit,
} from "src/__types__/interfaces";
import { FormProvider } from "./FormContext";
import {
  formFocusField,
  formRemoveField,
  formSetErrors,
  formUpdateField,
  formUpdateValues,
  isFormValid,
} from "./formHelpers";
import { log } from "./utils";

interface IRxFormInnerProps {
  handleSubmit: (onSubmit: TOnSubmit) => (formEvent: React.FormEvent) => any;
}

interface IRxFormProps {
  children: TChildrenRender<IRxFormInnerProps>;
  initialValues?: IFormValues;
}

export function RxForm(props: IRxFormProps) {
  const { formStateSubject$, formActionSubject$ } = useMemo(() => {
    return {
      formStateSubject$: new BehaviorSubject<IFormState>({
        fields: {},
        values: cloneDeep(props.initialValues) || {},
      }),
      formActionSubject$: new Subject(),
    };
  }, []);

  const updateFormValues = (formValues: IFormValues) => {
    formUpdateValues(formStateSubject$.getValue())(formValues);
  };

  const setErrors = (errors: TErrors) => {
    const fromState = formStateSubject$.getValue();
    const nextFormState = {
      values: fromState.values,
      fields: formSetErrors(errors, fromState.fields),
    };

    formStateSubject$.next(nextFormState);
  };

  const notifyFormActionChange = (action: IFormAction) => {
    formActionSubject$.next(action);
  };

  const getFormValues = () => {
    return formStateSubject$.getValue().values;
  };

  const getFormState = () => {
    return formStateSubject$.getValue();
  };

  const dispatch = (action: IFieldAction | IFormAction) => {
    const formState = formStateSubject$.getValue();
    const prevState = (process.env.NODE_ENV === "development" ? cloneDeep : (v: IFormState) => v)(formState);

    switch (action.type) {
      case FieldActionTypes.register:
      case FieldActionTypes.blur:
      case FieldActionTypes.change: {
        const nextFormState = formUpdateField(formState, action as IFieldAction);
        formStateSubject$.next(nextFormState);
        break;
      }
      case FieldActionTypes.focus: {
        const nextFormState = formFocusField(formState, action as IFieldAction);
        formStateSubject$.next(nextFormState);
        break;
      }
      case FieldActionTypes.destroy: {
        const nextFormState = formRemoveField(formState, action as IFieldAction);
        formStateSubject$.next(nextFormState);
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

  const handleSubmit = (onSubmit: TOnSubmit) => {
    return (evt: React.FormEvent) => {
      evt.preventDefault();

      const formState = formStateSubject$.getValue();

      dispatch({
        type: FormActionTypes.startSubmit,
        payload: formState, // TODO: remove payload
      });

      if (!isFormValid(formState.fields)) {
        return;
      }

      onSubmit(getFormValues(), setErrors);
    };
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
        setErrors,
      }}
    >
      {props.children({
        handleSubmit,
      })}
    </FormProvider>
  );
}
