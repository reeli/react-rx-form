import { isEmpty } from "lodash";

const createValidate = (isValid: (v: any) => boolean, defaultErrMsg: string) => {
  return (msg: string = defaultErrMsg) => {
    return (v: any) => {
      return isValid(v) ? undefined : msg;
    };
  };
};

export const required = createValidate(isEmpty, "no empty defaultValue");
export const maxLength5 = createValidate((value) => value.length > 5, "defaultValue length must less than 5");
