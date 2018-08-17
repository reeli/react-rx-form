import { Dictionary, forEach, isUndefined, mapValues, reduce } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { Observer } from "rxjs/internal/types";
import { TChildrenRender } from "../types/common";
import { FieldActionTypes, IFieldAction, IFieldState, TFieldValue } from "./Field";
import { FormContext } from "./FormContext";

export interface IFormState {
  [fieldName: string]: IFieldState;
}

export interface IFormValues {
  [fieldName: string]: TFieldValue;
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
      forEach(this.props.initialValues, (value, name) => {
        this.formState[name] = {
          ...this.formState[name],
          value,
          name,
        };
      });

      this.dispatch({
        type: FormActionTypes.initialize,
        payload: {
          formState: this.formState,
        },
      });
    }
  }

  componentWillUnmount() {
    if (this.formStateSubscription) {
      this.formStateSubscription.unsubscribe();
      this.formStateSubscription = null;
    }
  }

  registerField = (action: IFieldAction) => {
    this.formState = {
      ...this.formState,
      [action.payload.name]: {
        ...action.payload,
      } as IFieldState,
    };
    console.log(action.type, {
      [action.payload.name]: {
        ...action.payload,
      } as IFieldState,
    });
    this.formStateSubject$.next(this.formState);
  };

  updateField = (action: IFieldAction) => {
    const fieldState = {
      name: action.payload.name,
      value: "",
      error: undefined,
    } as IFieldState;

    if (!isUndefined(action.payload.value)) {
      fieldState.value = action.payload.value;
    }
    if (!isUndefined(action.payload.error)) {
      fieldState.error = action.payload.error;
    }
    this.formState = {
      ...this.formState,
      [action.payload.name]: fieldState,
    };
    console.log(action.type, { formState: this.formState });
    this.formStateSubject$.next(this.formState);
  };

  onSubmitError = (error: Dictionary<string>) => {
    this.formState = mapValues(this.formState, (field) => {
      return {
        ...field,
        error: error[field.name],
      };
    });
    this.formStateSubject$.next(this.formState);
  };

  updateFormState = (action: IFormAction) => {
    this.formState = action.payload.formState;
    this.formStateSubject$.next(this.formState);
    console.log(action.type, { formState: this.formState });
  };

  dispatch = (action: IFieldAction | IFormAction) => {
    switch (action.type) {
      case FieldActionTypes.register: {
        return this.registerField(action as IFieldAction);
      }
      case FieldActionTypes.change: {
        return this.updateField(action as IFieldAction);
      }
      case FormActionTypes.initialize: {
        return this.updateFormState(action as IFormAction);
      }
      case FormActionTypes.startSubmit: {
        return this.updateFormState(action as IFormAction);
      }
    }
  };

  subscribe = (observer: Observer<any>) => {
    return this.formStateSubject$.subscribe(observer);
  };

  subscribeFormAction = (observer: Observer<any>) => {
    return this.formActionSubject$.subscribe(observer);
  };

  validateForm = () => {
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

    return mapValues(this.formState, (field) => {
      return field.value;
    });
  };

  onSubmit = (evt: any) => {
    evt.preventDefault();

    // this.dispatch({
    //   type: FormActionTypes.startSubmit,
    //   payload: {
    //     formState: this.formState,
    //   },
    // });

    console.log("before start submit");
    this.formActionSubject$.next({
      type: FormActionTypes.startSubmit,
      payload: {
        formState: this.formState,
      },
    });

    console.log(this.formState, "formState");
    console.log("after start submit");

    const values = this.validateForm();

    if (values) {
      this.props.onSubmit(values, this.onSubmitError);
    }
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
          onSubmit: this.onSubmit,
        })}
      </FormContext.Provider>
    );
  }
}
