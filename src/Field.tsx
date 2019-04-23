import { get, isUndefined } from "lodash";
import React, { useContext, useLayoutEffect, useMemo, useState } from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { distinctUntilChanged, filter, map, tap } from "rxjs/operators";
import { isFieldDirty, pickValue, validateField } from "./fieldHelper";
import { FormContext } from "./FormContext";
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
} from "./interfaces";
import { useValueRef } from "./utils";

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
  const fieldValueRef = useValueRef(fieldValue);
  const fieldMetaRef = useValueRef(fieldMeta);

  const { registerField, triggerChange, onFocus, onChange, onBlur, formatValue } = useMemo(() => {
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

    const triggerChange = (evtOrValue: React.MouseEvent | TFieldValue, otherMeta?: IFieldMeta) => {
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

    return {
      registerField: ({ value, meta }: IFieldState) => {
        dispatch({
          name: prefixedName,
          type: FieldActionTypes.register,
          meta,
          payload: parseValue(value),
        });
      },
      onFocus: () => {
        dispatch({
          name: prefixedName,
          type: FieldActionTypes.focus,
          meta: {
            visited: true,
          },
        });
      },
      triggerChange,
      onChange: (evtOrValue: React.MouseEvent | TFieldValue) => triggerChange(evtOrValue),
      onBlur: (evtOrValue: React.MouseEvent | TFieldValue) => {
        const value = pickValue(evtOrValue);
        dispatch({
          name: prefixedName,
          type: FieldActionTypes.blur,
          meta: {
            visited: true,
            touched: true,
          },
          payload: parseValue(value),
        });
      },
      formatValue: (value: TFieldValue): TFieldValue => {
        const { format, normalize } = props;
        if (format && typeof format === "function") {
          value = format(value);
        }

        if (normalize && typeof normalize === "function") {
          value = normalize(value);
        }

        return value;
      },
    };
  }, []);

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
          tap(() =>
            triggerChange(fieldValueRef.current, {
              ...(fieldMetaRef.current as any),
              visited: true,
              touched: true,
            }),
          ),
        )
        .subscribe();

      formActionSubscription = subscribeFormAction(formActionObserver$);
    };

    // should register observers before register field, otherwise the last field will lost field state
    // this cause the last field render even if I only changed the first field

    onFormStateChange();
    onFormActionChange();

    registerField({
      value: fieldValueRef.current,
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
    value: formatValue(fieldValueRef.current),
    meta: fieldMeta,
    name: prefixedName,
    onChange,
    onFocus,
    onBlur,
  });
}
