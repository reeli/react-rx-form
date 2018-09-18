import { cloneDeep, forEach, isArray, isEmpty, isEqual, isUndefined, mapValues, reduce, set } from "lodash";
import {
  IFieldAction,
  IFieldInnerProps,
  IFieldProps,
  IForm,
  IFormAction,
  IFormState,
  IFormValues,
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

export const isContainError = (formState: IFormState) => {
  return reduce(formState, (result, item) => result || (item.meta && !!item.meta.error), false);
};

export const toFormValues = (formState: IFormState): IFormValues => {
  const formValues = {};
  forEach(formState, (field, key) => {
    if (field) {
      set(formValues, key, field.value);
    }
  });
  return formValues;
};

export const setErrors = (formState: IFormState, errors: TErrors) => {
  if (isEmpty(errors)) {
    return formState;
  }
  return mapValues(formState, (field, name) => {
    return {
      ...field,
      meta: {
        ...field.meta,
        error: errors[name],
      },
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
  prevState: IForm;
  nextState: IForm;
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
