import { IFieldAction, IFieldMeta, IFields, IFormState, IFormValues, TErrors } from "@react-rx/form";
import { isEmpty, keys, mapValues, omit, reduce, set } from "lodash";

export const formUpdateField = (state: IFormState, action: IFieldAction) => {
  const { fields, values } = state;
  const { payload, meta = {} as IFieldMeta, name } = action;
  return {
    fields: {
      ...fields,
      [name]: {
        ...fields[name],
        ...meta,
      },
    },
    values: set<IFormValues>({ ...values }, name, payload), // Notice: _.set will mutate object,
  };
};

export const formFocusField = (state: IFormState, action: IFieldAction) => {
  const { fields, values } = state;
  const { name, meta } = action;
  return {
    values,
    fields: {
      ...fields,
      [name]: {
        ...meta,
      },
    },
  };
};

export const formRemoveField = (state: IFormState, action: IFieldAction) => {
  if (action.meta && action.meta.destroyValueOnUnmount) {
    return {
      fields: omit(state.fields, action.name),
      values: omit(state.values, action.name),
    };
  }

  // keep values when field destroy for cross page form
  // eg: in PageA, switch to PageB, should keep PageA fields values.
  return {
    ...state,
    fields: omit(state.fields, action.name),
  };
};

export const formUpdateValues = (formState: IFormState) => {
  return (formValues: IFormValues) => ({
    fields: formState.fields,
    values: formValues,
  });
};

export const formSetFields = (fields: IFields) => {
  return mapValues(fields, (field) => ({
    ...field,
    touched: true,
    visited: true,
  }));
};

export const formSetErrors = (fields: IFields, errors: TErrors) => {
  if (isEmpty(errors)) {
    return fields;
  }
  return mapValues(fields, (field, name) => {
    return {
      ...field,
      error: errors[name],
    };
  });
};

export const setFieldsError = (errors: TErrors, fields: IFields): IFields => {
  if (isEmpty(errors)) {
    return mapValues(fields, (field) => {
      return {
        ...field,
        error: undefined,
      };
    });
  }

  const temp = {} as IFields;
  keys(errors).forEach((name: string) => {
    if (fields[name]) {
      temp[name] = {
        ...fields[name],
        error: errors[name],
      };
    }
  });
  return {
    ...fields,
    ...temp,
  };
};

export const isFormContainsError = (fields: IFields) => {
  return reduce(fields, (result, item) => result || (item && !!item.error), false);
};
