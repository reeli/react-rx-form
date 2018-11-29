import {
  cloneDeep,
  Dictionary,
  isArray,
  isBoolean,
  isEmpty,
  isEqual,
  isFunction,
  isNumber,
  isObject,
  isUndefined,
  keys,
  mapValues,
  omitBy,
  reduce,
} from "lodash";
import * as React from "react";
import {
  IFieldAction,
  IFieldInnerProps,
  IFieldProps,
  IFields,
  IFormAction,
  IFormState,
  TErrors,
  TFieldValue,
  TValidator,
} from "./interfaces";

export const combineValidators = (validators: TValidator[]) => {
  return (value: TFieldValue): string | undefined => {
    return reduce(
      validators,
      (error: string | undefined, validator) => {
        return error || validateField(value, validator);
      },
      undefined,
    );
  };
};

export const isContainError = (fields: IFields) => {
  return reduce(fields, (result, item) => result || (item && !!item.error), false);
};

export const setErrors = (fields: IFields, errors: TErrors) => {
  if (isEmpty(errors)) {
    return fields;
  }
  return mapValues(fields, (field, name) => {
    return {
      ...field,
      error: errors[name],
    };
  });
};

export const pickInputPropsFromFieldProps = ({ meta, ...others }: IFieldInnerProps) => {
  return {
    ...others,
    error: meta ? meta.error : undefined,
  };
};

export const isDirty = (value: TFieldValue, defaultValue: string) => {
  return !isEqual(value, defaultValue);
};

export const validateField = (value: string | boolean, validate?: IFieldProps["validate"]) => {
  if (isUndefined(validate)) {
    return;
  }

  if (isArray(validate)) {
    return combineValidators(validate)(value);
  }

  if (typeof validate === "function") {
    return validate(value);
  }

  return;
};

export const log = ({
  action,
  prevState,
  nextState,
}: {
  action: IFieldAction | IFormAction;
  prevState: IFormState;
  nextState: IFormState;
}) => {
  if (process.env.NODE_ENV === "development") {
    console.groupCollapsed(`${action.type} ${new Date()}`);
    // use cloneDeep here in case state is a reference type
    console.log("prevState", cloneDeep(prevState));
    console.log("action", cloneDeep(action));
    console.log("nextState", cloneDeep(nextState));
    console.groupEnd();
  }
};

export const dropEmpty = <T = Dictionary<any>>(values: T) => {
  return omitBy(values, isEmptyValue);
};

export const isEmptyValue = (value: any) => {
  if (isBoolean(value) || isFunction(value) || isNumber(value)) {
    return false;
  }
  if (isArray(value) && value.length === 0) {
    return true;
  }
  return isEmpty(value);
};

export const pickValue = (evtOrValue: React.MouseEvent | TFieldValue) => {
  const isEvent = isObject(evtOrValue) && evtOrValue.target;
  return isEvent ? evtOrValue.target.value : evtOrValue;
};

export const setFieldsMeta = (fields: IFields) => {
  return mapValues(fields, (field) => ({
    ...field,
    touched: true,
    visited: true,
  }));
};

export const setFieldsError = (errors: TErrors, fields: IFields) => {
  const temp = {} as IFields;
  keys(errors).forEach((name: string) => {
    if (fields[name]) {
      temp[name] = {
        ...fields[name],
        error: errors[name],
      };
    }
  });
  return {
    ...fields,
    ...temp,
  };
};
