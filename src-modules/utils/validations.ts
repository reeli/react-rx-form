import { isEmpty } from "lodash";
import { TFieldValue } from "../rx-form/Field";

export const required = (value: TFieldValue) => {
  return isEmpty(value) ? "no empty value" : undefined;
};

export const maxLength5 = (value: TFieldValue) => {
  return (value as string).length > 5 ? "value length must less than 5" : undefined;
};
