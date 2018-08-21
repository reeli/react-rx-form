import { isNull, isUndefined, reduce } from "lodash";
import { TFieldValue } from "./Field";

export const combine = (validators: any) => {
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

export const isExist = (value: any) => {
  return !isUndefined(value) && !isNull(value);
};
