import { forEach, isArray, isNaN, isObject, mapValues, reduce, set } from "lodash";
import { IFieldInnerProps, TFieldValue, TValidator } from "./Field";
import { IFormState, IFormValues, IRxFormProps, TErrors } from "./RxForm";

export const combineValidators = (validators: TValidator[]) => {
  return (value: TFieldValue) => {
    return reduce(
      validators,
      (error: string | undefined, validator) => {
        return !error ? validator(value) : error;
      },
      undefined,
    );
  };
};

export const isContainError = (formState: IFormState) => {
  return reduce(formState, (result, item) => result || (item.meta && !!item.meta.error), false);
};

export const pickFormValues = (formState: IFormState): IFormValues => {
  const formValues = {};
  forEach(formState, (field, key) => {
    set(formValues, key, field.value);
  });
  return formValues;
};

export const setErrors = (formState: IFormState, errors: TErrors) => {
  return mapValues(formState, (field) => {
    return {
      ...field,
      meta: {
        ...field.meta,
        error: errors[field.name],
      },
    };
  });
};

const formatKeyPath = (key: string) => {
  return !isNaN(parseInt(key, 10)) ? `[${key}]` : key;
};

export const toObjWithKeyPath = (input: IRxFormProps["initialValues"]) => {
  const res = {} as any;
  const toKeyPath = (obj: any, prefix: string = "") => {
    Object.keys(obj).map((key) => {
      const value = obj[key];
      if (isArray(value) || isObject(value)) {
        const suffix = !isArray(value) && isObject(value) ? "." : "";
        toKeyPath(value, prefix + formatKeyPath(key) + suffix);
      } else {
        res[prefix + formatKeyPath(key)] = value;
      }
    });
  };
  toKeyPath(input);
  return res;
};

export const pickInputPropsFromFieldProps = ({ meta: { error }, ...others }: IFieldInnerProps) => {
  return {
    ...others,
    error,
  };
};
