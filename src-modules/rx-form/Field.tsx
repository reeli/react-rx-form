import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { distinctUntilChanged, filter, map, tap } from "rxjs/operators";
import { FormContext, IFormContextValue } from "./FormContext";
import { FormActionTypes, IFormAction, IFormState } from "./RxForm";
import { TChildrenRender } from "./types";
import { isDirty, validateField } from "./utils";

export enum FieldActionTypes {
  register = "@@rx-form/field/REGISTER_FIELD",
  change = "@@rx-form/field/CHANGE",
  destroy = "@@rx-form/field/DESTROY_FIELD",
}

type TError = string | undefined;
export type TValidator = (value: string | boolean) => TError | undefined;
export type TFieldValue = any;

interface IFieldCommonProps {
  name: string;
  value?: TFieldValue;
  meta: {
    dirty: boolean;
    error?: TError;
  };
}

export interface IFieldState extends IFieldCommonProps {}

export interface IFieldInnerProps extends IFieldState {
  onChange: (value: TFieldValue) => void;
}

export interface IFieldProps {
  name: string;
  children: TChildrenRender<IFieldInnerProps>;
  defaultValue?: TFieldValue;
  validate?: TValidator | TValidator[];
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

export class FieldCore extends React.Component<IFieldCoreProps, IFieldCoreState> {
  private formStateSubscription: Subscription | null = null;
  private formActionSubscription: Subscription | null = null;

  state = {
    fieldState: {
      name: this.props.name,
      // TODO: change defaultValue to defaultValue, toggle controlled component and uncontrolled component
      // in component level, default value should not be empty string, because sometime it should be boolean,
      // think about checkbox.
      value: this.props.defaultValue,
      meta: {
        error: undefined,
        dirty: false,
      },
    },
  };

  componentDidMount() {
    this.registerField(this.state.fieldState);
    this.onFormStateChange();
    this.onStartSubmitForm();
  }

  onStartSubmitForm = () => {
    const formActionObserver$ = new Subject<IFormAction>();

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
          const error = validateField(fieldState.value, this.props.validate);

          if (error) {
            this.props.formContextValue.dispatch({
              type: FieldActionTypes.change,
              payload: {
                ...fieldState,
                meta: {
                  ...fieldState.meta,
                  error,
                },
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
    const formStateObserver$ = new Subject<IFormState>();
    formStateObserver$
      .pipe(
        map((formState: IFormState) => {
          return formState[this.props.name];
        }),
        distinctUntilChanged(),
        tap((fieldState: IFieldState) => {
          console.log(fieldState, "--------xxxx==============");
          this.setState({
            fieldState,
          });
        }),
      )
      .subscribe();

    this.formStateSubscription = this.props.formContextValue.subscribe(formStateObserver$);
  };

  onChange = (value: TFieldValue) => {
    this.props.formContextValue.dispatch({
      type: FieldActionTypes.change,
      payload: {
        name: this.props.name,
        value,
        meta: {
          error: validateField(value, this.props.validate),
          dirty: isDirty(value, this.props.defaultValue),
        },
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
