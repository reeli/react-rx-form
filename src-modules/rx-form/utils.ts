import { forEach, isArray, keys, map, reduce } from "lodash";
import { TFieldValue, TValidator } from "./Field";
import { IFormState, IFormValues } from "./RxForm";

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

export const isFormContainsError = (formState: IFormState) => {
  let hasError = false;
  const validate = (input: IFormState) => {
    forEach(input, (fieldState) => {
      if (isArray(fieldState)) {
        forEach(fieldState, (item) => {
          validate(item);
        });
      } else {
        hasError = !!fieldState.error ? true : hasError;
      }
    });
    return hasError;
  };
  return validate(formState);
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
