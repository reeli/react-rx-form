import { Dictionary, mapValues, reduce } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { Observer } from "rxjs/internal/types";
import { TChildrenRender } from "../types/common";
import { IFieldState } from "./Field";
import { FormContext } from "./FormContext";

export interface IFormState {
  [name: string]: IFieldState;
}

export interface IFormValues {
  [name: string]: string;
}

interface IIRxFormInnerProps {
  onSubmit: (evt: any) => void;
}

interface IRxFormProps {
  onSubmit: (values: IFormValues, onSubmitError: any) => void;
  children: TChildrenRender<IIRxFormInnerProps>;
}

export interface IFormAction {
  type: string;
  payload: {
    fields: IFormState;
  };
}

export enum FieldActionTypes {
  register = "register",
  change = "change",
  unregister = "unregister",
}

export enum FormActionTypes {
  startSubmit = "startSubmit",
}

interface IFieldAction {
  type: FieldActionTypes;
  name: string;
  value?: string;
  error?: string;
}

export class RxForm extends React.Component<IRxFormProps> {
  private formState$ = new Subject();
  private formStateSubject$ = new Subject();
  private formActionsSubscription: Subscription | null = null;
  private formState = {} as IFormState;
  private formStateSubscription: Subscription | null = null;

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

  initFields = (action: IFieldAction) => {
    this.formState = {
      ...this.formState,
      [action.name]: {
        name: action.name,
      } as IFieldState,
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

  updateFields = (action: IFieldAction) => {
    const fieldState = {
      name: action.name,
    } as IFieldState;
    if (action.value) {
      fieldState.value = action.value;
    }
    if (action.error) {
      fieldState.error = action.error;
    }
    this.formState = {
      ...this.formState,
      [action.name]: fieldState,
    };
    this.formState$.next(this.formState);
  };

  dispatch = (fieldAction: IFieldAction) => {
    switch (fieldAction.type) {
      case FieldActionTypes.register: {
        return this.initFields(fieldAction);
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
    return this.formStateSubject$.subscribe(observer);
  };

  onSubmit = (evt: any) => {
    evt.preventDefault();
    this.formStateSubject$.next({
      type: FormActionTypes.startSubmit,
      payload: {
        fields: this.formState,
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
