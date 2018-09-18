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
  IForm,
  IFormAction,
  TFieldValue,
} from "./interfaces";
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
    this.onFormActionChange();
  }

  onFormActionChange = () => {
    const formActionObserver$ = new Subject<IFormAction>();

    formActionObserver$
      .pipe(
        filter((formAction: IFormAction) => {
          return formAction.type === FormActionTypes.startSubmit;
        }),
        map((formAction: IFormAction) => {
          return {
            fieldState: formAction.payload.formState[this.props.name],
            value: get(formAction.payload.values, this.props.name),
          };
        }),
        distinctUntilChanged(),
        tap(({ fieldState, value }: { fieldState: IFieldState; value: any }) => {
          const error = validateField(value, this.props.validate);

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
    const formStateObserver$ = new Subject<IForm>();
    formStateObserver$
      .pipe(
        map((form) => {
          return {
            fieldState: form.formState[this.props.name],
            value: get(form.values, this.props.name),
          };
        }),
        distinctUntilChanged(),
        tap(({ fieldState, value }) => {
          if (fieldState || value) {
            this.setState({
              fieldState: {
                ...fieldState,
                value,
              },
            });
          }
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
