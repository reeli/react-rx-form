import { cloneDeep } from "lodash";
import React, { useMemo } from "react";
import { BehaviorSubject, Subject, Observer } from "rxjs";
import { FormProvider } from "./FormContext";
import {
  formFocusField,
  formRemoveField,
  formSetErrors,
  formUpdateField,
  formUpdateValues,
  isFormValid,
} from "./formHelpers";
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
} from "./interfaces";
import { log } from "./utils";

interface IRxFormInnerProps {
  handleSubmit: (onSubmit: TOnSubmit) => (formEvent: React.FormEvent) => any;
}

interface IRxFormProps {
  children: TChildrenRender<IRxFormInnerProps>;
  initialValues?: IFormValues;
}

export function RxForm(props: IRxFormProps) {
  const { handleSubmit, ...formCtxValue } = useMemo(() => {
    const formStateSubject$ = new BehaviorSubject<IFormState>({
      fields: {},
      values: cloneDeep(props.initialValues) || {},
    });
    const formActionSubject$ = new Subject();

    const dispatch = (action: IFieldAction | IFormAction) => {
      const prevState = (process.env.NODE_ENV === "development" ? cloneDeep : (v: IFormState) => v)(
        formStateSubject$.getValue(),
      );

      switch (action.type) {
        case FieldActionTypes.register:
        case FieldActionTypes.blur:
        case FieldActionTypes.change: {
          const nextFormState = formUpdateField(formStateSubject$.getValue(), action as IFieldAction);
          formStateSubject$.next(nextFormState);
          break;
        }
        case FieldActionTypes.focus: {
          const nextFormState = formFocusField(formStateSubject$.getValue(), action as IFieldAction);
          formStateSubject$.next(nextFormState);
          break;
        }
        case FieldActionTypes.destroy: {
          const nextFormState = formRemoveField(formStateSubject$.getValue(), action as IFieldAction);
          formStateSubject$.next(nextFormState);
          break;
        }
        case FormActionTypes.startSubmit: {
          notifyFormActionChange(action as IFormAction);
          break;
        }
      }

      const nextState = (process.env.NODE_ENV === "development" ? cloneDeep : (v: IFormState) => v)(
        formStateSubject$.getValue(),
      );

      log({
        action,
        prevState,
        nextState,
      });
    };

    const notifyFormActionChange = (action: IFormAction) => {
      formActionSubject$.next(action);
    };

    const setErrors = (errors: TErrors) => {
      const fromState = formStateSubject$.getValue();
      const nextFormState = {
        values: fromState.values,
        fields: formSetErrors(errors, fromState.fields),
      };

      formStateSubject$.next(nextFormState);
    };

    const getFormValues = () => {
      return formStateSubject$.getValue().values;
    };

    const getFormState = () => {
      return formStateSubject$.getValue();
    };

    return {
      subscribe: (observer: Observer<any>) => {
        return formStateSubject$.subscribe(observer);
      },
      dispatch,
      subscribeFormAction: (observer: Observer<any>) => {
        return formActionSubject$.subscribe(observer);
      },
      updateFormValues: (formValues: IFormValues) => {
        formUpdateValues(formStateSubject$.getValue())(formValues);
      },
      getFormValues,
      getFormState,
      setErrors,
      handleSubmit: (onSubmit: TOnSubmit) => {
        return (evt: React.FormEvent) => {
          evt.preventDefault();

          dispatch({
            type: FormActionTypes.startSubmit,
          });

          if (!isFormValid(formStateSubject$.getValue().fields)) {
            return;
          }

          onSubmit(getFormValues(), setErrors);

          dispatch({
            type: FormActionTypes.endSubmit,
          });
        };
      },
    };
  }, []);

  return (
    <FormProvider value={formCtxValue}>
      {props.children({
        handleSubmit,
      })}
    </FormProvider>
  );
}
