import { get } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { distinctUntilChanged, filter, map, tap } from "rxjs/operators";
import { FormContext } from "./FormContext";
import {
  FieldActionTypes,
  FormActionTypes,
  IFieldCoreProps,
  IFieldCoreState,
  IFieldProps,
  IFieldState,
  IFormAction,
  IFormState,
  TFieldValue,
} from "./interface";
import { isDirty, validateField } from "./utils";

const getFieldValue = ({ defaultValue, formContextValue, name }: IFieldCoreProps) => {
  const formValues = formContextValue.getFormValues();
  return get(formValues, name) || defaultValue;
};

export class FieldCore extends React.Component<IFieldCoreProps, IFieldCoreState> {
  private formStateSubscription: Subscription | null = null;
  private formActionSubscription: Subscription | null = null;

  state = {
    fieldState: {
      // TODO: change defaultValue to defaultValue, toggle controlled component and uncontrolled component
      // in component level, default value should not be empty string, because sometime it should be boolean,
      // think about checkbox.
      value: getFieldValue(this.props),
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

  // 当 field name 发生变化时应该 unregister 上一个 field，register 另一个 field，或者使用 key，以保证 field unmount 而不是 did update
  // componentDidUpdate(nextProps: IFieldProps) {
  //   if (nextProps.name !== this.props.name) {
  //     this.props.formContextValue.dispatch({
  //       name: nextProps.name,
  //       type: FieldActionTypes.change,
  //       payload: this.state.fieldState,
  //     });
  //   }
  // }

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
              name: this.props.name,
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
    this.props.formContextValue.dispatch({
      name: this.props.name,
      type: FieldActionTypes.destroy,
    });

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
      name: this.props.name,
      type: FieldActionTypes.register,
      payload: fieldState,
    });
  };

  onFormStateChange = () => {
    const formStateObserver$ = new Subject<IFormState>();
    formStateObserver$
      .pipe(
        map((formState: IFormState) => formState[this.props.name]),
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

  onChange = (value: TFieldValue) => {
    this.props.formContextValue.dispatch({
      name: this.props.name,
      type: FieldActionTypes.change,
      payload: {
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
      name: this.props.name,
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
