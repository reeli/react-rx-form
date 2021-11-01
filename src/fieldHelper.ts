import { isArray, isEqual, isObject, isUndefined, reduce } from "lodash";

import { TFieldValue, TValidator } from "./interfaces";

export const isFieldDirty = (value: TFieldValue, defaultValue: string) => {
  return !isEqual(value, defaultValue);
};

export const validateField = (value: string | boolean, validate?: TValidator | TValidator[]) => {
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

export const pickValue = (evtOrValue: MouseEvent | TFieldValue) => {
  const isEvent = isObject(evtOrValue) && (evtOrValue as any).target;
  return isEvent ? (evtOrValue as any).target.value : evtOrValue;
};
