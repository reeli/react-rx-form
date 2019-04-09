import { isEmpty, keys, mapValues, omit, reduce, set } from "lodash";
import { IFieldAction, IFieldMeta, IFields, IFormState, IFormValues, TErrors } from "src/__types__/interfaces";

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

export const formSetErrors = (errors: TErrors, fields: IFields): IFields => {
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

export const isFormValid = (fields: IFields) => {
  return reduce(fields, (result, item) => result && (item && !item.error), true);
};
