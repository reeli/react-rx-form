import { forEach, isArray, keys, map, mapValues, reduce, set } from "lodash";
import { TFieldValue, TValidator } from "./Field";
import { IFormState, IFormValues, TErrors } from "./RxForm";

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
  return reduce(formState, (result, item) => result || !!item.error, false);
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
      error: errors[field.name],
    };
  });
};

export const convertArrayToObjWithKeyPaths = (input: IFormValues | IFormValues[]) => {
  const obj = {} as any;
  map(input, (item, key) => {
    if (isArray(item)) {
      const toKeyPath = (arr: any[]) => {
        map(arr, (val, idx) => {
          keys(val).forEach((path) => {
            obj[`${key}[${idx}].${path}`] = val[path];
          });
        });
      };

      toKeyPath(item);
    } else {
      obj[key] = item;
    }
  });
  return obj;
};
