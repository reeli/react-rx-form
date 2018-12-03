import { get, isUndefined } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { distinctUntilChanged, filter, map, tap } from "rxjs/operators";
import { FormConsumer } from "./FormContext";
import {
  FieldActionTypes,
  FormActionTypes,
  IFieldCoreProps,
  IFieldMeta,
  IFieldProps,
  IFieldState,
  IFormAction,
  IFormState,
  TFieldValue,
} from "./interfaces";
import { isDirty, pickValue, validateField } from "./utils";

const getFieldValue = ({ defaultValue, getFormValues, name }: IFieldCoreProps) => {
  const formValues = getFormValues();
  const initialValue = get(formValues, name);
  if (!isUndefined(initialValue)) {
    return initialValue;
  }
  return defaultValue;
};

export class FieldCore extends React.Component<IFieldCoreProps, IFieldState> {
  private formStateSubscription: Subscription | null = null;
  private formActionSubscription: Subscription | null = null;

  state = {
    value: getFieldValue(this.props),
    meta: {},
  };

  componentDidMount() {
    const { value, meta } = this.state;

    // should register observers before register field, otherwise the last field will lost field state
    // this cause the last field render even if I only changed the first field

    this.onFormStateChange();
    this.onFormActionChange();

    this.registerField({
      value,
      meta,
    });
  }

  componentWillUnmount() {
    this.props.dispatch({
      name: this.props.name,
      type: FieldActionTypes.destroy,
      meta: {
        destroyValueOnUnmount: !!this.props.destroyValueOnUnmount,
      },
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
    const { name } = this.props;
    const formStateObserver$ = new Subject<IFormState>();
    formStateObserver$
      .pipe(
        map(({ fields, values }) => ({
          meta: fields[name],
          value: get(values, name),
        })),
        distinctUntilChanged((next, prev) => next.meta === prev.meta && prev.value === next.value),
        tap(({ meta, value }) => {
          if (meta || value) {
            this.setState({
              meta,
              value,
            });
          }
        }),
      )
      .subscribe();

    this.formStateSubscription = this.props.subscribe(formStateObserver$);
  };

  onFormActionChange = () => {
    const formActionObserver$ = new Subject<IFormAction>();
    const { name, validate } = this.props;

    formActionObserver$
      .pipe(
        filter(({ type }: IFormAction) => type === FormActionTypes.startSubmit),
        map(({ payload: { fields, values } }: IFormAction) => ({
          meta: fields[name],
          value: get(values, name),
        })),
        tap(({ value }: { meta: IFieldMeta; value: TFieldValue }) => {
          const error = validateField(value, validate);
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

  onChange = (evtOrValue: React.MouseEvent | TFieldValue) => {
    const value = pickValue(evtOrValue);
    const dirty = isDirty(value, this.props.defaultValue);
    const meta = {
      error: validateField(value, this.props.validate),
      dirty,
    } as IFieldMeta;
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

  onBlur = (evtOrValue: React.MouseEvent | TFieldValue) => {
    const value = pickValue(evtOrValue);
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
    const { value, meta } = this.state;
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
