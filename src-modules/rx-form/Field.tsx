import { isArray, isBoolean } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { distinctUntilChanged, map, tap } from "rxjs/operators";
import { FormContext, IFormContextValue } from "./FormContext";
import { IFormState } from "./RxForm";
import { combine } from "./utils";

export enum FieldActionTypes {
  register = "@@rx-form/REGISTER_FIELD",
  change = "@@rx-form/CHANGE",
  destroy = "@@rx-form/DESTROY_FIELD",
}

type TError = string;
type TValidator = (value: string | boolean) => TError | undefined;
export type TFieldValue = any;

interface IFieldCommon {
  name: string;
  value: TFieldValue;
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

interface IFieldCoreProps extends IField {
  formContextValue: IFormContextValue;
}

interface IFieldCoreState {
  fieldState: IFieldState;
}

class FieldCore extends React.Component<IFieldCoreProps, IFieldCoreState> {
  private formStateSubscription: Subscription | null = null;

  state = {
    fieldState: {} as IFieldState,
  };

  componentDidMount() {
    const { name, value, error } = this.props;
    this.register({ name, value, error });

    this.onFormStateChange();
    // this.onFormStartSubmit();
  }

  register = ({ name, value, error }: IFieldCommon) => {
    // register field
    this.props.formContextValue.dispatch({
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

  onChange = (value: string | boolean) => {
    this.props.formContextValue.dispatch({
      type: FieldActionTypes.change,
      payload: {
        name: this.props.name,
        value,
        error: this.props.validate ? this.validate(value) : undefined,
      },
    });
  };

  handleChange = (evt: React.ChangeEvent<any>) => {
    switch (this.props.type) {
      case "checkbox":
        return this.onChange(!!evt.target.checked);
      default:
        this.onChange(evt.target.value);
    }
  };

  componentWillUnmount() {
    if (this.formStateSubscription) {
      this.formStateSubscription.unsubscribe();
      this.formStateSubscription = null;
    }
  }

  patchFieldState = (fieldState: IFieldState) => {
    const { value = "", ...others } = fieldState;
    if (this.props.type === "checkbox") {
      return {
        ...others,
        checked: value,
        value: isBoolean(value) ? value.toString() : value,
      };
    }
    return {
      ...others,
      value,
    };
  };

  render() {
    const { component, formContextValue, ...otherProps } = this.props;
    return React.createElement(component, {
      ...otherProps,
      onChange: this.handleChange,
      ...this.patchFieldState(this.state.fieldState),
    });
  }
}

export class Field extends React.Component<IField> {
  render() {
    return (
      <FormContext.Consumer>
        {(formContextValue) => <FieldCore formContextValue={formContextValue} {...this.props} />}
      </FormContext.Consumer>
    );
  }
}
