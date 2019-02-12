import { filter, get, map, set, size, times } from "lodash";
import React, { useContext, useLayoutEffect, useState } from "react";
import { TChildrenRender, TFieldValue } from "src/__types__/interfaces";
import { FormContext, FormProvider } from "./FormContext";

type TMapper = (prefix: string, idx: number) => JSX.Element;

interface IFieldArrayInnerProps {
  add: () => any;
  remove: (idx: number) => any;
  each: (mapper: TMapper) => any;
  fields: any[];
}

interface IFieldArrayProps {
  name: string;
  children: TChildrenRender<IFieldArrayInnerProps>;
  initLength?: number;
}

function FieldArrayCore(props: IFieldArrayProps) {
  const { getFormValues, updateFormValues } = useContext(FormContext);
  const getFieldsByIdx = (): string[] => {
    return map(get(getFormValues(), props.name), (_, idx: number) => `[${idx}]`);
  };

  const [fields, setFields] = useState(getFieldsByIdx());

  useLayoutEffect(() => {
    const fieldArrayValues = get(getFormValues(), props.name);
    if (props.initLength) {
      times(props.initLength - size(fieldArrayValues), add);
    }
    return () => {};
  }, []);

  const remove = (idx: number) => {
    const formValues = getFormValues();
    const newFieldArrayValues = filter(get(formValues, props.name), (_, n: number) => {
      return n !== idx;
    });

    const nextFormValues = set(formValues, props.name, newFieldArrayValues);
    updateFormValues(nextFormValues);

    setFields(getFieldsByIdx());
  };

  const add = () => {
    const formValues = getFormValues();
    const nextFormValues = set(formValues, props.name, get(formValues, props.name, []).concat(undefined));

    updateFormValues(nextFormValues);

    setFields(getFieldsByIdx());
  };

  const each = (mapper: TMapper) => {
    const fieldValues = get(getFormValues(), props.name);
    return map(fieldValues, (_: TFieldValue, idx: number) => {
      const name = `[${idx}]`;
      return mapper(name, idx);
    });
  };

  return props.children({
    fields,
    add,
    each,
    remove: (idx: number) => remove(idx),
  });
}

export const FieldArray = (props: IFieldArrayProps) => {
  const formContext = useContext(FormContext);
  const name = `${formContext.fieldPrefix || ""}${props.name}`;
  return (
    <FormProvider
      value={{
        ...formContext,
        fieldPrefix: name,
      }}
    >
      <FieldArrayCore {...props} name={name} />
    </FormProvider>
  );
};
