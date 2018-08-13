import { Dictionary, forEach, mapValues, reduce } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { Observer } from "rxjs/internal/types";
import { TChildrenRender } from "../types/common";
import { IFieldAction, IFieldState } from "./Field";
import { FormContext } from "./FormContext";

export interface IFormState {
  [fieldName: string]: IFieldState;
}

export interface IFormValues {
  [fieldName: string]: string;
}

interface IIRxFormInnerProps {
  onSubmit: (evt: any) => void;
}

interface IRxFormProps {
  onSubmit: (values: IFormValues, onSubmitError: any) => void;
  children: TChildrenRender<IIRxFormInnerProps>;
  initialValues?: IFormValues;
}

export interface IFormAction {
  type: string;
  payload: {
    formState: IFormState;
  };
}

export enum FieldActionTypes {
  register = "register",
  change = "change",
  unregister = "unregister",
}

export enum FormActionTypes {
  initial = "initial",
  startSubmit = "startSubmit",
}

export class RxForm extends React.Component<IRxFormProps> {
  private formState = {} as IFormState;

  private formState$ = new Subject();
  private formActions$ = new Subject();

  private formStateSubscription: Subscription | null = null;
  private formActionsSubscription: Subscription | null = null;

  componentDidMount() {
    if (this.props.initialValues) {
      const initialFormState = {} as IFormState;

      forEach(this.props.initialValues, (value, key) => {
        initialFormState[key] = {
          value,
          name: key,
          error: "",
        };
      });

      this.formActions$.next({
        type: FormActionTypes.initial,
        payload: {
          formState: initialFormState,
        },
      } as IFormAction);
    }
  }

  componentWillUnmount() {
    if (this.formStateSubscription) {
      this.formStateSubscription.unsubscribe();
      this.formStateSubscription = null;
    }
    if (this.formActionsSubscription) {
      this.formActionsSubscription.unsubscribe();
      this.formActionsSubscription = null;
    }
  }

  initField = (action: IFieldAction) => {
    this.formState = {
      ...this.formState,
      [action.payload.name]: {
        name: action.payload.name,
      } as IFieldState,
    };
    this.formState$.next(this.formState);
  };

  updateFields = (action: IFieldAction) => {
    const fieldState = {
      name: action.payload.name,
    } as IFieldState;

    if (action.payload.value) {
      fieldState.value = action.payload.value;
    }
    if (action.payload.error) {
      fieldState.error = action.payload.error;
    }
    this.formState = {
      ...this.formState,
      [action.payload.name]: fieldState,
    };
    this.formState$.next(this.formState);
  };

  onSubmitError = (error: Dictionary<string>) => {
    this.formState = mapValues(this.formState, (field) => {
      return {
        ...field,
        error: error[field.name],
      };
    });
    this.formState$.next(this.formState);
  };

  dispatch = (fieldAction: IFieldAction) => {
    switch (fieldAction.type) {
      case FieldActionTypes.register: {
        return this.initField(fieldAction);
      }
      case FieldActionTypes.change: {
        return this.updateFields(fieldAction);
      }
    }
  };

  subscribe = (observer: Observer<any>) => {
    return this.formState$.subscribe(observer);
  };

  subscribeFormSubmit = (observer: Observer<any>) => {
    return this.formActions$.subscribe(observer);
  };

  onSubmit = (evt: any) => {
    evt.preventDefault();
    this.formActions$.next({
      type: FormActionTypes.startSubmit,
      payload: {
        formState: this.formState,
      },
    } as IFormAction);

    const hasError = reduce(
      this.formState,
      (result: boolean, item: IFieldState) => {
        return result || !!item.error;
      },
      false,
    );

    if (hasError) {
      return;
    }

    const values = mapValues(this.formState, (field) => {
      return field.value;
    });

    this.props.onSubmit(values, this.onSubmitError);
  };

  render() {
    return (
      <FormContext.Provider
        value={{
          subscribe: this.subscribe,
          dispatch: this.dispatch,
          subscribeFormSubmit: this.subscribeFormSubmit,
        }}
      >
        {this.props.children({
          onSubmit: this.onSubmit,
        })}
      </FormContext.Provider>
    );
  }
}
