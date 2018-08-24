import { forEach, isArray, reduce } from "lodash";
import { TFieldValue, TValidator } from "./Field";
import { IFormState } from "./RxForm";

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
