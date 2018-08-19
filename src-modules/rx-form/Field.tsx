import { isArray, isEqual } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { distinctUntilChanged, filter, map, tap } from "rxjs/operators";
import { TChildrenRender } from "../types/common";
import { isExist } from "../utils/common";
import { FormContext, IFormContextValue } from "./FormContext";
import { FormActionTypes, IFormAction, IFormState } from "./RxForm";
import { combine } from "./utils";

export enum FieldActionTypes {
  register = "@@rx-form/REGISTER_FIELD",
  change = "@@rx-form/CHANGE",
  destroy = "@@rx-form/DESTROY_FIELD",
}

type TError = string | undefined;
type TValidator = (value: string | boolean) => TError | undefined;
export type TFieldValue = any;

interface IFieldCommonProps {
  name: string;
  value?: TFieldValue;
  error?: TError;
}

export interface IFieldState extends IFieldCommonProps {
  dirty: boolean;
}

interface IFieldInnerProps extends IFieldState {
  onChange: (value: TFieldValue) => void;
}

export interface IFieldProps extends IFieldCommonProps {
  validate?: TValidator | TValidator[];
  children: TChildrenRender<IFieldInnerProps>;
}

export interface IFieldAction {
  type: FieldActionTypes;
  payload: IFieldState;
}

interface IFieldCoreProps extends IFieldProps {
  formContextValue: IFormContextValue;
}

interface IFieldCoreState {
  fieldState: IFieldState;
}

class FieldCore extends React.Component<IFieldCoreProps, IFieldCoreState> {
  private formStateSubscription: Subscription | null = null;
  private formActionSubscription: Subscription | null = null;

  state = {
    fieldState: {
      name: this.props.name,
      value: isExist(this.props.value) ? this.props.value : "",
      error: this.props.error,
      dirty: false,
    },
  };

  componentDidMount() {
    this.registerField(this.state.fieldState);
    this.onFormStateChange();
    this.onStartSubmitForm();
  }

  onStartSubmitForm = () => {
    const formActionObserver$ = new Subject();
    formActionObserver$
      .pipe(
        filter((formAction: IFormAction) => {
          return formAction.type === FormActionTypes.startSubmit;
        }),
        map((formAction: IFormAction) => {
          return formAction.payload.formState[this.props.name];
        }),
        distinctUntilChanged(),
        tap((fieldState: IFieldState) => {
          const error = this.validate(fieldState.value);

          if (error) {
            this.props.formContextValue.dispatch({
              type: FieldActionTypes.change,
              payload: {
                ...fieldState,
                error,
              },
            });
          }
        }),
      )
      .subscribe();

    this.formActionSubscription = this.props.formContextValue.subscribeFormAction(formActionObserver$);
  };

  componentWillUnmount() {
    if (this.formStateSubscription) {
      this.formStateSubscription.unsubscribe();
      this.formStateSubscription = null;
    }
    if (this.formActionSubscription) {
      this.formActionSubscription.unsubscribe();
      this.formActionSubscription = null;
    }
  }

  registerField = (fieldState: IFieldState) => {
    // register field
    this.props.formContextValue.dispatch({
      type: FieldActionTypes.register,
      payload: fieldState,
    });
  };

  onFormStateChange = () => {
    const formStateObserver$ = new Subject();
    formStateObserver$
      .pipe(
        map((formState: IFormState) => {
          return formState[this.props.name];
        }),
        distinctUntilChanged(),
        tap((fieldState: IFieldState) => {
          this.setState({
            fieldState,
          });
        }),
      )
      .subscribe();

    this.formStateSubscription = this.props.formContextValue.subscribe(formStateObserver$);
  };

  validate = (value: string | boolean) => {
    const { validate } = this.props;
    if (typeof validate === "function") {
      return validate(value);
    }

    if (isArray(validate)) {
      return combine(validate)(value);
    }
    return;
  };

  isDirty = (value: TFieldValue) => {
    return !isEqual(value, this.state.fieldState.value);
  };

  onChange = (value: TFieldValue) => {
    this.props.formContextValue.dispatch({
      type: FieldActionTypes.change,
      payload: {
        name: this.props.name,
        value,
        error: this.props.validate ? this.validate(value) : undefined,
        dirty: this.isDirty(value),
      },
    });
  };

  render() {
    return this.props.children({
      ...this.state.fieldState,
      onChange: this.onChange,
    });
  }
}

export class Field extends React.Component<IFieldProps> {
  render() {
    return (
      <FormContext.Consumer>
        {(formContextValue) => {
          return <FieldCore formContextValue={formContextValue} {...this.props} />;
        }}
      </FormContext.Consumer>
    );
  }
}
