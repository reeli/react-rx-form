import { isArray } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { distinctUntilChanged, filter, map, tap } from "rxjs/operators";
import { FormContext, IFormContextValue } from "./FormContext";
import { FormActionTypes, IFormAction, IFormState } from "./RxForm";
import { combine } from "./utils";

enum FieldActionTypes {
  register = "register",
  change = "change",
  unregister = "unregister",
}

type TError = string;
type TValidator = (value: string) => TError | undefined;

interface IFieldCommon {
  name: string;
  value: string;
  error?: TError;
}

export interface IField extends IFieldCommon {
  component: any;
  type?: string;
  validate?: TValidator | TValidator[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

export interface IFieldState extends IFieldCommon {}

export interface IFieldAction {
  type: FieldActionTypes;
  payload: IFieldState;
}

interface IFieldCoreProps extends IField, IFormContextValue {}

interface IFieldCoreState {
  fieldState: IFieldState;
}

class FieldCore extends React.Component<IFieldCoreProps, IFieldCoreState> {
  private formStateSubscription: Subscription | null = null;
  private formActionsSubscription: Subscription | null = null;

  state = {
    fieldState: {} as IFieldState,
  };

  componentDidMount() {
    const { name, value, error } = this.props;
    this.register({ name, value, error });

    this.onFormStateChange();
    this.onFormStartSubmit();
  }

  register = ({ name, value, error }: IFieldCommon) => {
    // register field
    this.props.dispatch({
      type: FieldActionTypes.register,
      payload: {
        name,
        value,
        error,
      },
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

    this.formStateSubscription = this.props.subscribe(formStateObserver$);
  };

  onFormStartSubmit = () => {
    if (this.props.validate) {
      const formActionsObserver$ = new Subject();
      formActionsObserver$
        .pipe(
          filter((action: IFormAction) => action.type === FormActionTypes.initial),
          map((action: IFormAction) => {
            console.log(action, this.props.name, action.payload.formState[this.props.name], "------");
            return action.payload.formState[this.props.name];
          }),
          distinctUntilChanged(),
          tap((field: IField) => {
            const value = field ? field.value || "" : "";
            this.onChange(value);
          }),
        )
        .pipe(
          filter((action: IFormAction) => action.type === FormActionTypes.startSubmit),
          map((action: IFormAction) => {
            return action.payload.formState[this.props.name];
          }),
          distinctUntilChanged(),
          tap((field: IField) => {
            const value = field ? field.value || "" : "";
            this.onChange(value);
          }),
        )
        .subscribe();
      this.formActionsSubscription = this.props.subscribeFormSubmit(formActionsObserver$);
    }
  };

  validate = (value: string) => {
    const { validate } = this.props;
    if (typeof validate === "function") {
      return validate(value);
    }

    if (isArray(validate)) {
      return combine(validate)(value);
    }
    return;
  };

  onChange = (value: string) => {
    this.props.dispatch({
      type: FieldActionTypes.change,
      payload: {
        name: this.props.name,
        value,
        error: this.props.validate ? this.validate(value) : undefined,
      },
    });
  };

  handleChange = (evt: React.ChangeEvent<any>) => {
    this.onChange(evt.target.value);
  };

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

  render() {
    const { component, ...otherProps } = this.props;
    return React.createElement(component, {
      ...otherProps,
      onChange: this.handleChange,
      ...this.state.fieldState,
    });
  }
}

export class Field extends React.Component<IField> {
  render() {
    return <FormContext.Consumer>{(formProps) => <FieldCore {...formProps} {...this.props} />}</FormContext.Consumer>;
  }
}
