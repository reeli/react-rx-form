import { cloneDeep, set } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
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
import { dropEmpty, isContainError, log, setErrors } from "./utils";

export class RxForm extends React.Component<IRxFormProps> {
  private formState = {
    fields: {},
    values: this.props.initialValues || {},
  } as IFormState;
  private formStateSubject$ = new Subject();
  private formActionSubject$ = new Subject();
  private formStateSubscription: Subscription | null = null;

  componentDidMount() {
    this.dispatch({
      type: FormActionTypes.initialize,
      payload: {
        fields: this.formState.fields,
        values: this.formState.values,
      },
    });
  }

  setFormValues = (formValues: IFormValues) => {
    this.formState = {
      // When initialize, formState has no value at this time，
      // but will have data after field registered with values
      fields: this.formState.fields,
      values: formValues,
    };

    this.dispatch({
      type: FormActionTypes.onChange,
      payload: {
        fields: this.formState.fields,
        values: {
          ...this.formState.values,
        },
      },
    });
  };

  componentWillUnmount() {
    if (this.formStateSubscription) {
      this.formStateSubscription.unsubscribe();
      this.formStateSubscription = null;
    }
  }

  updateField = (action: IFieldAction) => {
    const { payload, meta = {} as IFieldMeta, name } = action;
    this.formState = {
      fields: {
        ...this.formState.fields,
        [name]: {
          ...this.formState.fields[name],
          ...meta,
        },
      },
      values: dropEmpty({
        ...set<IFormValues>(this.formState.values, name, payload),
      }),
    };
    this.formStateSubject$.next(this.formState);
  };

  onSubmitError = (errors: TErrors) => {
    // TODO: Check if if values should be different if fields contains error

    this.formState = {
      values: this.formState.values,
      fields: setErrors(this.formState.fields, errors),
    };

    this.formStateSubject$.next(this.formState);
    this.dispatch({
      type: FormActionTypes.startSubmitFailed,
      payload: {
        fields: this.formState.fields,
        values: this.formState.values,
      },
    });
  };

  notifyFormActionChange = (action: IFormAction) => {
    this.formActionSubject$.next(action);
  };

  getFormValues = () => {
    return this.formState.values;
  };

  removeField = (action: IFieldAction) => {
    delete this.formState.fields[action.name];
    this.formStateSubject$.next(this.formState);
  };

  updateFieldState = (action: IFieldAction) => {
    this.formState = {
      values: this.formState.values,
      fields: {
        ...this.formState.fields,
        [action.name]: {
          ...action.meta,
        },
      },
    };
  };

  dispatch = (action: IFieldAction | IFormAction) => {
    const prevState = cloneDeep(this.formState);

    switch (action.type) {
      case FieldActionTypes.register:
      case FieldActionTypes.blur:
      case FieldActionTypes.change: {
        this.updateField(action as IFieldAction);
        break;
      }
      case FieldActionTypes.focus: {
        this.updateFieldState(action as IFieldAction);
        break;
      }
      case FieldActionTypes.destroy: {
        this.removeField(action as IFieldAction);
        break;
      }
      case FormActionTypes.initialize:
      case FormActionTypes.startSubmit:
      case FormActionTypes.onChange:
      case FormActionTypes.startSubmitFailed: {
        this.notifyFormActionChange(action as IFormAction);
        break;
      }
    }

    const nextState = cloneDeep(this.formState);

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

  handleSubmit = (onSubmit: TOnSubmit) => {
    return (evt: React.FormEvent) => {
      evt.preventDefault();

      this.dispatch({
        type: FormActionTypes.startSubmit,
        payload: {
          fields: this.formState.fields,
          values: this.formState.values,
        },
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

  updateFormValues = (formValues: IFormValues) => {
    this.setFormValues(formValues);
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
        }}
      >
        {this.props.children({
          handleSubmit: this.handleSubmit,
        })}
      </FormProvider>
    );
  }
}
