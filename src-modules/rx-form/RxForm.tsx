import { Dictionary, forEach, isArray, keys } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { Observer } from "rxjs/internal/types";
import { FieldActionTypes, IFieldAction, IFieldState, TFieldValue } from "./Field";
import { FormContext } from "./FormContext";
import { TChildrenRender } from "./types";
import { isContainError, pickFormValues, setErrors, toObjWithKeyPath } from "./utils";

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
}

export class RxForm extends React.Component<IRxFormProps> {
  private formState = {} as IFormState;
  private formStateSubject$ = new Subject();
  private formActionSubject$ = new Subject();
  private formStateSubscription: Subscription | null = null;

  componentDidMount() {
    if (this.props.initialValues) {
      this.setInitialValues(this.props.initialValues);
    }
    this.dispatch({
      type: FormActionTypes.initialize,
      payload: {
        formState: this.formState,
      },
    });
  }

  setInitialValues = (initialValues: IRxFormProps["initialValues"]) => {
    forEach(initialValues, (value, name) => {
      if (isArray(value)) {
        const values = toObjWithKeyPath(initialValues!);
        keys(values).forEach((key) => {
          this.formState[key] = {
            ...this.formState[key],
            value: values[key],
            name: key,
          };
        });
      } else {
        this.formState[name] = {
          ...this.formState[name],
          value,
          name,
        };
      }
    });
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
  };

  initializeForm = (action: IFormAction) => {
    this.formStateSubject$.next(action.payload.formState);
    this.formActionSubject$.next(action);
  };

  startSubmitForm = (action: IFormAction) => {
    this.formActionSubject$.next(action);
  };

  dispatch = (action: IFieldAction | IFormAction) => {
    switch (action.type) {
      case FieldActionTypes.register: {
        return this.updateField(action as IFieldAction);
      }
      case FieldActionTypes.change: {
        return this.updateField(action as IFieldAction);
      }
      case FormActionTypes.initialize: {
        return this.initializeForm(action as IFormAction);
      }
      case FormActionTypes.startSubmit: {
        return this.startSubmitForm(action as IFormAction);
      }
    }
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

      console.log(JSON.stringify(this.formState));
      if (isContainError(this.formState)) {
        return;
      }

      const values = pickFormValues(this.formState);
      if (values) {
        onSubmit(values, this.onSubmitError);
      }
    };
  };

  render() {
    return (
      <FormContext.Provider
        value={{
          subscribe: this.subscribe,
          dispatch: this.dispatch,
          subscribeFormAction: this.subscribeFormAction,
        }}
      >
        {this.props.children({
          handleSubmit: this.handleSubmit,
        })}
      </FormContext.Provider>
    );
  }
}
