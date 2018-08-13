import { reduce } from "lodash";
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
