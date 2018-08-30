import { cloneDeep, Dictionary, keys } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { Observer } from "rxjs/internal/types";
import { FieldActionTypes, IFieldAction, IFieldState, TFieldValue } from "./Field";
import { FormContext } from "./FormContext";
import { TChildrenRender } from "./types";
import { isContainError, log, setErrors, toFormValues, toObjWithKeyPath } from "./utils";

export interface IFormState {
  [fieldName: string]: IFieldState;
}

export interface IFormValues {
  [fieldName: string]: TFieldValue;
}

export type TErrors = Dictionary<string | undefined>;
type TOnSubmit = (values: IFormValues, onSubmitError: (errors: TErrors) => any) => any;

interface IRxFormInnerProps {
  handleSubmit: (onSubmit: TOnSubmit) => (formEvent: React.FormEvent) => any;
}

export interface IRxFormProps {
  children: TChildrenRender<IRxFormInnerProps>;
  initialValues?: IFormValues | IFormValues[];
}

export interface IFormAction {
  type: string;
  payload: {
    formState: IFormState;
  };
}

export enum FormActionTypes {
  initialize = "@@rx-form/INITIALIZE",
  startSubmit = "@@rx-form/START_SUBMIT",
  startSubmitFailed = "@@rx-form/START_SUBMIT_FAILED",
}

export class RxForm extends React.Component<IRxFormProps> {
  private formState = {} as IFormState;
  private formStateSubject$ = new Subject();
  private formActionSubject$ = new Subject();
  private formStateSubscription: Subscription | null = null;

  componentDidMount() {
    if (this.props.initialValues) {
      this.setFormValues(this.props.initialValues);
    }
    this.dispatch({
      type: FormActionTypes.initialize,
      payload: {
        formState: this.formState,
      },
    });
  }

  setFormValues = (formValues: IFormValues) => {
    const values = toObjWithKeyPath(formValues!);
    keys(values).forEach((key) => {
      if (this.formState[key]) {
        this.formState[key] = {
          ...this.formState[key],
          value: values[key],
          name: key,
        };
      }
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
    this.formState[action.payload.name] = action.payload;
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
        }}
      >
        {this.props.children({
          handleSubmit: this.handleSubmit,
        })}
      </FormContext.Provider>
    );
  }
}
