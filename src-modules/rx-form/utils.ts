import { reduce } from "lodash";
import { TFieldValue, TValidator } from "./Field";

export const combine = (validators: TValidator[]) => {
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
