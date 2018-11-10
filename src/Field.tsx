import { get, isEqual, isUndefined } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { distinctUntilChanged, filter, map, tap } from "rxjs/operators";
import { FormConsumer } from "./FormContext";
import {
  FieldActionTypes,
  FormActionTypes,
  IFieldCoreProps,
  IFieldCoreState,
  IFieldMeta,
  IFieldProps,
  IFieldState,
  IFormAction,
  IFormState,
  TFieldValue,
} from "./interfaces";
import { dropEmpty, isDirty, validateField } from "./utils";

const getFieldValue = ({ defaultValue, getFormValues, name }: IFieldCoreProps) => {
  const formValues = getFormValues();
  const initialValue = get(formValues, name);
  if (!isUndefined(initialValue)) {
    return initialValue;
  }
  return defaultValue;
};

export class FieldCore extends React.Component<IFieldCoreProps, IFieldCoreState> {
  private formStateSubscription: Subscription | null = null;
  private formActionSubscription: Subscription | null = null;

  state = {
    fieldState: {
      value: getFieldValue(this.props),
      meta: {},
    },
  };

  componentDidMount() {
    this.registerField(this.state.fieldState);
    this.onFormStateChange();
    this.onFormActionChange();
  }

  componentWillUnmount() {
    this.props.dispatch({
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

  onFormStateChange = () => {
    const formStateObserver$ = new Subject<IFormState>();
    formStateObserver$
      .pipe(
        map((formState) => ({
          fields: formState.fields[this.props.name],
          value: get(formState.values, this.props.name),
        })),
        distinctUntilChanged(isEqual),
        tap(({ fields, value }) => {
          if (fields || value) {
            this.setState({
              fieldState: {
                meta: fields,
                value,
              },
            });
          }
        }),
      )
      .subscribe();

    this.formStateSubscription = this.props.subscribe(formStateObserver$);
  };

  onFormActionChange = () => {
    const formActionObserver$ = new Subject<IFormAction>();

    formActionObserver$
      .pipe(
        filter((formAction: IFormAction) => formAction.type === FormActionTypes.startSubmit),
        map((formAction: IFormAction) => ({
          meta: formAction.payload.fields[this.props.name],
          value: get(formAction.payload.values, this.props.name),
        })),
        distinctUntilChanged(),
        tap(({ value }: { meta: IFieldMeta; value: TFieldValue }) => {
          const error = validateField(value, this.props.validate);
          if (error) {
            this.onChange(value);
          }
        }),
      )
      .subscribe();

    this.formActionSubscription = this.props.subscribeFormAction(formActionObserver$);
  };

  registerField = ({ value, meta }: IFieldState) => {
    // register field
    this.props.dispatch({
      name: this.props.name,
      type: FieldActionTypes.register,
      meta,
      payload: this.parseValue(value),
    });
  };

  onChange = (value: TFieldValue) => {
    const dirty = isDirty(value, this.props.defaultValue);
    const meta = dropEmpty({
      error: validateField(value, this.props.validate),
      dirty,
    }) as IFieldMeta;
    this.props.dispatch({
      name: this.props.name,
      type: FieldActionTypes.change,
      meta,
      payload: this.parseValue(value),
    });
  };

  onFocus = () => {
    this.props.dispatch({
      name: this.props.name,
      type: FieldActionTypes.focus,
      meta: {
        visited: true,
      },
    });
  };

  onBlur = (value: TFieldValue) => {
    this.props.dispatch({
      name: this.props.name,
      type: FieldActionTypes.blur,
      meta: {
        touched: true,
      },
      payload: this.parseValue(value),
    });
  };

  parseValue = (value: TFieldValue): TFieldValue => {
    if (typeof this.props.parse === "function") {
      return this.props.parse(value);
    }
    return value;
  };

  formatValue = (value: TFieldValue): TFieldValue => {
    if (typeof this.props.format === "function") {
      return this.props.format(value);
    }
    return value;
  };

  render() {
    const { value, meta } = this.state.fieldState;
    return this.props.children({
      value: this.formatValue(value),
      meta,
      name: this.props.name,
      onChange: this.onChange,
      onFocus: this.onFocus,
      onBlur: this.onBlur,
    });
  }
}

export const Field = React.forwardRef((props: IFieldProps, ref?: React.Ref<any>) => (
  <FormConsumer>
    {(formContextValue) => {
      return (
        <FieldCore
          {...formContextValue}
          {...props}
          name={`${formContextValue.fieldPrefix || ""}${props.name}`}
          ref={ref}
        />
      );
    }}
  </FormConsumer>
));
