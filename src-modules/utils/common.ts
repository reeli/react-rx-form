import { isNull, isUndefined } from "lodash";

export const isExist = (value: any) => {
  return !isUndefined(value) && !isNull(value);
};
