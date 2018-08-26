import { size } from "lodash";
import { TFieldValue } from "../rx-form/Field";

const createValidate = (isValid: (v: any) => boolean, defaultErrMsg: string) => {
  return (msg: string = defaultErrMsg) => {
    return (v: TFieldValue) => {
      return isValid(v) ? undefined : msg;
    };
  };
};

export const required = createValidate((value) => size(value) > 0, "no empty defaultValue");
export const maxLength5 = createValidate((value) => value.length < 5, "defaultValue length must less than 5");
