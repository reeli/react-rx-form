import { get, isUndefined } from "lodash";
import React, { useContext, useLayoutEffect, useState } from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { distinctUntilChanged, filter, map, tap } from "rxjs/operators";
import {
  FieldActionTypes,
  FormActionTypes,
  IFieldInnerProps,
  IFieldMeta,
  IFieldState,
  IFormAction,
  IFormState,
  IFormValues,
  TChildrenRender,
  TFieldValue,
  TValidator,
} from "src/__types__/interfaces";
import { isFieldDirty, pickValue, validateField } from "./fieldHelper";
import { FormContext } from "./FormContext";

interface IFieldProps {
  name: string;
  children: TChildrenRender<IFieldInnerProps>;
  defaultValue?: TFieldValue;
  validate?: TValidator | TValidator[];
  format?: (value: TFieldValue) => TFieldValue;
  parse?: (value: TFieldValue) => TFieldValue;
  normalize?: (value: TFieldValue) => TFieldValue;
  destroyValueOnUnmount?: boolean;
}

const getFieldValue = ({
  defaultValue,
  formValues,
  prefixedName,
}: {
  defaultValue: TFieldValue;
  formValues: IFormValues;
  prefixedName: string;
}) => {
  const initialValue = get(formValues, prefixedName);
  if (!isUndefined(initialValue)) {
    return initialValue;
  }
  return defaultValue;
};

export function Field(props: IFieldProps) {
  const { dispatch, subscribe, subscribeFormAction, getFormValues, fieldPrefix } = useContext(FormContext);
  const prefixedName = `${fieldPrefix || ""}${props.name}`;

  const defaultValue = getFieldValue({
    defaultValue: props.defaultValue,
    formValues: getFormValues(),
    prefixedName,
  });

  const [fieldValue, setFieldValue] = useState(defaultValue);
  const [fieldMeta, setFieldMeta] = useState({});

  const onChange = (evtOrValue: React.MouseEvent | TFieldValue, otherMeta?: IFieldMeta) => {
    const value = parseValue(pickValue(evtOrValue));
    const dirty = isFieldDirty(value, props.defaultValue);

    const meta = {
      ...otherMeta,
      error: validateField(value, props.validate),
      dirty,
    } as IFieldMeta;

    dispatch({
      name: prefixedName,
      type: FieldActionTypes.change,
      meta,
      payload: value,
    });
  };

  const onFocus = () => {
    dispatch({
      name: prefixedName,
      type: FieldActionTypes.focus,
      meta: {
        visited: true,
      },
    });
  };

  const onBlur = (evtOrValue: React.MouseEvent | TFieldValue) => {
    const value = pickValue(evtOrValue);
    dispatch({
      name: prefixedName,
      type: FieldActionTypes.blur,
      meta: {
        touched: true,
      },
      payload: parseValue(value),
    });
  };

  const parseValue = (value: TFieldValue): TFieldValue => {
    const { parse, normalize } = props;
    if (parse && typeof parse === "function") {
      value = parse(value);
    }

    if (normalize && typeof normalize === "function") {
      value = normalize(value);
    }

    return value;
  };

  const formatValue = (value: TFieldValue): TFieldValue => {
    const { format, normalize } = props;
    if (format && typeof format === "function") {
      value = format(value);
    }

    if (normalize && typeof normalize === "function") {
      value = normalize(value);
    }

    return value;
  };

  useLayoutEffect(() => {
    let formStateSubscription: Subscription | null = null;
    let formActionSubscription: Subscription | null = null;

    const onFormStateChange = () => {
      const formStateObserver$ = new Subject<IFormState>();

      formStateObserver$
        .pipe(
          map(({ fields, values }) => ({
            meta: fields[prefixedName],
            value: get(values, prefixedName),
          })),
          distinctUntilChanged((next, prev) => next.meta === prev.meta && prev.value === next.value),
          tap(({ meta, value }) => {
            if (meta || value) {
              setFieldValue(value);
              setFieldMeta(meta);
            }
          }),
        )
        .subscribe();

      formStateSubscription = subscribe(formStateObserver$);
    };

    const onFormActionChange = () => {
      const formActionObserver$ = new Subject<IFormAction>();

      formActionObserver$
        .pipe(
          filter(({ type }: IFormAction) => type === FormActionTypes.startSubmit),
          map(({ payload: { fields, values } }: IFormAction) => ({
            meta: {
              ...fields[prefixedName],
              touched: true,
              visited: true,
            },
            value: get(values, prefixedName),
          })),
          tap(({ value, meta }: { meta: IFieldMeta; value: TFieldValue }) => onChange(value, meta)),
        )
        .subscribe();

      formActionSubscription = subscribeFormAction(formActionObserver$);
    };

    const registerField = ({ value, meta }: IFieldState) => {
      // register field
      dispatch({
        name: prefixedName,
        type: FieldActionTypes.register,
        meta,
        payload: parseValue(value),
      });
    };

    // should register observers before register field, otherwise the last field will lost field state
    // this cause the last field render even if I only changed the first field

    onFormStateChange();
    onFormActionChange();

    registerField({
      value: fieldValue,
      meta: fieldMeta,
    });

    return () => {
      dispatch({
        name: prefixedName,
        type: FieldActionTypes.destroy,
        meta: {
          destroyValueOnUnmount: !!props.destroyValueOnUnmount,
        },
      });

      if (formStateSubscription) {
        formStateSubscription.unsubscribe();
      }
      if (formActionSubscription) {
        formActionSubscription.unsubscribe();
      }
    };
  }, []);

  return props.children({
    value: formatValue(fieldValue),
    meta: fieldMeta,
    name: prefixedName,
    onChange,
    onFocus,
    onBlur,
  });
}
