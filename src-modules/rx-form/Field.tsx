import { isArray, reduce } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { distinctUntilChanged, map, tap } from "rxjs/operators";
import { FormContext, IFormContext } from "./FormContext";
import { IFields } from "./RxForm";

enum FieldActionTypes {
  register = "register",
  change = "change",
  unregister = "unregister",
}

type TError = string;
type TValidator = (value: string) => TError | undefined;

const compose = (validators: any) => {
  return (value: string) => {
    return reduce(
      validators,
      (error: string | undefined, validator) => {
        return !error ? validator(value) : error;
      },
      undefined,
    );
  };
};

export interface IField {
  name: string;
  component: any;
  type?: string;
  value?: string;
  error?: TError;
  validate?: TValidator;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export interface IFieldAction {
  type: FieldActionTypes;
  name: string;
  value?: string;
  error?: TError;
}

interface IFieldCoreProps extends IField, IFormContext {}

interface IFieldState {
  field: IField;
}

class FieldCore extends React.Component<IFieldCoreProps, IFieldState> {
  private subscription: Subscription | null = null;
  private formSubscription: Subscription | null = null;

  state = {
    field: {} as IField,
  };

  componentDidMount() {
    this.props.dispatch({
      type: FieldActionTypes.register,
      name: this.props.name,
      value: this.props.value,
      error: this.props.error,
    });

    const fieldSubject$ = new Subject();
    fieldSubject$
      .pipe(
        map((fields: IFields) => {
          return fields[this.props.name];
        }),
        distinctUntilChanged(),
        tap((field: IField) => {
          console.log(field, "fieldState");
          this.setState({
            field,
          });
        }),
      )
      .subscribe();

    this.subscription = this.props.subscribe(fieldSubject$);

    if (this.props.validate) {
      const sub$ = new Subject();
      sub$
        .pipe(
          map((fields: IFields) => {
            return fields[this.props.name];
          }),
          distinctUntilChanged(),
          tap((field: IField) => {
            const value = field ? field.value || "" : "";
            this.sendData(value);
          }),
        )
        .subscribe();
      this.formSubscription = this.props.subscribeFormSubmit(sub$);
    }
  }

  validate = (value: string) => {
    const { validate } = this.props;
    if (typeof validate === "function") {
      return validate(value);
    }

    if (isArray(validate)) {
      return compose(validate)(value);
    }
    return;
  };

  sendData = (value: string) => {
    this.props.dispatch({
      type: FieldActionTypes.change,
      name: this.props.name,
      value,
      error: this.validate(value),
    });
  };

  onChange = (evt: React.ChangeEvent<any>) => {
    this.sendData(evt.target.value);
  };

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
      this.formSubscription = null;
    }
  }

  render() {
    const { component, ...otherProps } = this.props;
    return React.createElement(component, { ...otherProps, onChange: this.onChange, ...this.state.field });
  }
}

export class Field extends React.Component<IField> {
  render() {
    return <FormContext.Consumer>{(formProps) => <FieldCore {...formProps} {...this.props} />}</FormContext.Consumer>;
  }
}
