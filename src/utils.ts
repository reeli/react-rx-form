import { cloneDeep, Dictionary, isArray, isBoolean, isEmpty, isFunction, isNumber, omitBy } from "lodash";
import { IFieldAction, IFieldInnerProps, IFieldMeta, IFormAction, IFormState } from "src/__types__/interfaces";

export const log = ({
  action,
  prevState,
  nextState,
}: {
  action: IFieldAction | IFormAction;
  prevState: IFormState;
  nextState: IFormState;
}) => {
  if (process.env.NODE_ENV === "development") {
    console.groupCollapsed(`${action.type} ${new Date()}`);
    // use cloneDeep here in case state is a reference type
    console.log("prevState", cloneDeep(prevState));
    console.log("action", cloneDeep(action));
    console.log("nextState", cloneDeep(nextState));
    console.groupEnd();
  }
};

export const dropEmpty = <T = Dictionary<any>>(values: T) => {
  return omitBy(values, isEmptyValue);
};

export const isEmptyValue = (value: any) => {
  if (isBoolean(value) || isFunction(value) || isNumber(value)) {
    return false;
  }
  if (isArray(value) && value.length === 0) {
    return true;
  }
  return isEmpty(value);
};

export const pickInputPropsFromFieldProps = <T extends { meta: IFieldMeta } = IFieldInnerProps>({
  meta,
  ...others
}: T) => {
  return {
    ...others,
    error: meta ? meta.error : undefined,
  };
};
