import { cloneDeep, omit, set } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Observer } from "rxjs/internal/types";
import { FormProvider } from "./FormContext";
import {
  FieldActionTypes,
  FormActionTypes,
  IFieldAction,
  IFieldMeta,
  IFormAction,
  IFormState,
  IFormValues,
  IRxFormProps,
  TErrors,
  TOnSubmit,
} from "./interfaces";
import { isContainError, log, setErrors, setFieldsError, setFieldsMeta } from "./utils";
import { WithDidMount } from "./WithDidMount";

export class RxForm extends React.Component<IRxFormProps> {
  private formState = {
    fields: {},
    values: this.props.initialValues || {},
  } as IFormState;
  private formStateSubject$ = new Subject();
  private formActionSubject$ = new Subject();

  updateFormValues = (formValues: IFormValues) => {
    this.formState = {
      fields: this.formState.fields,
      values: formValues,
    };
  };

  updateField = (state: IFormState, action: IFieldAction) => {
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
      values: set<IFormValues>(values, name, payload),
    };
  };

  updateFieldState = (state: IFormState, action: IFieldAction) => {
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

  onSubmitError = (errors: TErrors) => {
    // TODO: Check if if values should be different if fields contains error

    this.formState = {
      values: this.formState.values,
      fields: setErrors(this.formState.fields, errors),
    };

    this.formStateSubject$.next(this.formState);
  };

  setErrors = (errors: TErrors) => {
    this.formState = {
      values: this.formState.values,
      fields: setFieldsError(errors, this.formState.fields),
    };
    this.formStateSubject$.next(this.formState);
  };

  notifyFormActionChange = (action: IFormAction) => {
    this.formActionSubject$.next(action);
  };

  getFormValues = () => {
    return this.formState.values;
  };

  getFormState = () => {
    return this.formState;
  };

  removeField = (state: IFormState, action: IFieldAction) => {
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

  dispatch = (action: IFieldAction | IFormAction) => {
    const prevState = (process.env.NODE_ENV === "development" ? cloneDeep : (v: IFormState) => v)(this.formState);

    switch (action.type) {
      case FieldActionTypes.register:
      case FieldActionTypes.blur:
      case FieldActionTypes.change: {
        this.formState = this.updateField(this.formState, action as IFieldAction);
        this.formStateSubject$.next(this.formState);
        break;
      }
      case FieldActionTypes.focus: {
        this.formState = this.updateFieldState(this.formState, action as IFieldAction);
        this.formStateSubject$.next(this.formState);
        break;
      }
      case FieldActionTypes.destroy: {
        this.formState = this.removeField(this.formState, action as IFieldAction);
        this.formStateSubject$.next(this.formState);
        break;
      }
      case FormActionTypes.startSubmit: {
        this.notifyFormActionChange(action as IFormAction);
        break;
      }
    }

    const nextState = (process.env.NODE_ENV === "development" ? cloneDeep : (v: IFormState) => v)(this.formState);

    log({
      action,
      prevState,
      nextState,
    });
  };

  subscribe = (observer: Observer<any>) => {
    return this.formStateSubject$.subscribe(observer);
  };

  subscribeFormAction = (observer: Observer<any>) => {
    return this.formActionSubject$.subscribe(observer);
  };

  updateFormState = (formState: IFormState) => {
    this.formStateSubject$.next(formState);
  };

  handleSubmit = (onSubmit: TOnSubmit) => {
    return (evt: React.FormEvent) => {
      evt.preventDefault();

      this.formState = {
        fields: setFieldsMeta(this.formState.fields),
        values: this.formState.values,
      };

      this.updateFormState(this.formState);

      this.dispatch({
        type: FormActionTypes.startSubmit,
        payload: this.formState,
      });

      if (isContainError(this.formState.fields)) {
        return;
      }

      const values = this.getFormValues();
      if (values) {
        onSubmit(values, this.onSubmitError);
      }
    };
  };

  notifyFormState = () => {
    this.formStateSubject$.next(this.formState);
  };

  render() {
    return (
      <FormProvider
        value={{
          subscribe: this.subscribe,
          dispatch: this.dispatch,
          subscribeFormAction: this.subscribeFormAction,
          updateFormValues: this.updateFormValues,
          getFormValues: this.getFormValues,
          getFormState: this.getFormState,
          setErrors: this.setErrors,
        }}
      >
        <WithDidMount onDidMount={this.notifyFormState} />
        {this.props.children({
          handleSubmit: this.handleSubmit,
        })}
      </FormProvider>
    );
  }
}
