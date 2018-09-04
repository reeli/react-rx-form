import { cloneDeep, keys } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { Observer } from "rxjs/internal/types";
import { FormContext } from "./FormContext";
import {
  FieldActionTypes,
  FormActionTypes,
  IFieldAction,
  IFormAction,
  IFormState,
  IFormValues,
  IRxFormProps,
  TErrors,
  TOnSubmit,
} from "./interfaces";
import { isContainError, log, setErrors, toFormValues, toObjWithKeyPath } from "./utils";

export class RxForm extends React.Component<IRxFormProps> {
  private formState = {} as IFormState;
  private formStateSubject$ = new Subject();
  private formActionSubject$ = new Subject();
  private formStateSubscription: Subscription | null = null;

  componentDidMount() {
    this.dispatch({
      type: FormActionTypes.initialize,
      payload: {
        formState: this.formState,
      },
    });

    if (this.props.initialValues) {
      this.setFormValues(this.props.initialValues);
    }
  }

  setFormValues = (formValues: IFormValues) => {
    const values = toObjWithKeyPath(formValues!);
    // create a empty object, in case merge deleted field back
    const nextFormState = {} as IFormState;

    keys(values).forEach((key) => {
      if (!this.formState[key] || this.formState[key].value !== values[key]) {
        nextFormState[key] = {
          ...this.formState[key],
          value: values[key],
        };
      } else {
        nextFormState[key] = this.formState[key];
      }
    });

    this.formState = nextFormState;
    this.dispatch({
      type: FormActionTypes.onChange,
      payload: {
        formState: this.formState,
      },
    });
    this.formStateSubject$.next(this.formState);
  };

  componentWillUnmount() {
    if (this.formStateSubscription) {
      this.formStateSubscription.unsubscribe();
      this.formStateSubscription = null;
    }
  }

  updateField = (action: IFieldAction) => {
    this.formState[action.name] = action.payload!;
    this.formStateSubject$.next(this.formState);
  };

  onSubmitError = (errors: TErrors) => {
    this.formState = setErrors(this.formState, errors);
    this.formStateSubject$.next(this.formState);
    this.dispatch({
      type: FormActionTypes.startSubmitFailed,
      payload: {
        formState: this.formState,
      },
    });
  };

  notifyFormActionChange = (action: IFormAction) => {
    this.formActionSubject$.next(action);
  };

  getFormValues = () => {
    return toFormValues(this.formState);
  };

  removeField = (action: IFieldAction) => {
    delete this.formState[action.name];
    this.formStateSubject$.next(this.formState);
  };

  dispatch = (action: IFieldAction | IFormAction) => {
    const prevState = cloneDeep(this.formState);

    switch (action.type) {
      case FieldActionTypes.register: {
        this.updateField(action as IFieldAction);
        break;
      }
      case FieldActionTypes.change: {
        this.updateField(action as IFieldAction);
        break;
      }
      case FieldActionTypes.destroy: {
        this.removeField(action as IFieldAction);
        break;
      }
      case FormActionTypes.initialize: {
        this.notifyFormActionChange(action as IFormAction);
        break;
      }
      case FormActionTypes.startSubmit: {
        this.notifyFormActionChange(action as IFormAction);
        break;
      }
      case FormActionTypes.startSubmitFailed: {
        this.notifyFormActionChange(action as IFormAction);
        break;
      }
      case FormActionTypes.onChange: {
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
          formState: this.formState,
        },
      });

      if (isContainError(this.formState)) {
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
      <FormContext.Provider
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
      </FormContext.Provider>
    );
  }
}
