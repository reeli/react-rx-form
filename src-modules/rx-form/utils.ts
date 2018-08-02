import { reduce } from "lodash";

export const combine = (validators: any) => {
  return (value: string) => {
    return reduce(
      validators,
      (error: string | undefined, validator) => {
        return !error ? validator(value) : error;
      },
      undefined,
    );
  };
};
