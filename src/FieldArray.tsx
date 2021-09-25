import { filter, get, map, set, size, times } from "lodash";
import React, { useContext, useLayoutEffect, useMemo, useState } from "react";
import { FormContext, FormProvider } from "./FormContext";
import { TChildrenRender, TFieldValue } from "./interfaces";

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
  const defaultFields = getFieldsByIdx();
  const [fields, setFields] = useState(defaultFields);

  const { add, each, remove } = useMemo(
    () => ({
      remove: (idx: number) => {
        const formValues = getFormValues();
        const newFieldArrayValues = filter(get(formValues, props.name), (_, n: number) => {
          return n !== idx;
        });

        const nextFormValues = set(formValues, props.name, newFieldArrayValues);
        updateFormValues(nextFormValues);

        setFields(getFieldsByIdx);
      },

      add: () => {
        const formValues = getFormValues();
        // undefined 只是为了增加一个节点，让 Field 自己去渲染，然后 Field 渲染时才会把 key 注册给 form，得到新的包含 field 的 form value
        const fieldValues = get(formValues, props.name, []).concat(undefined);
        const nextFormValues = set(formValues, props.name, fieldValues);

        updateFormValues(nextFormValues);

        setFields(getFieldsByIdx);
      },

      each: (mapper: TMapper) => {
        const fieldValues = get(getFormValues(), props.name);
        return map(fieldValues, (_: TFieldValue, idx: number) => {
          const name = `[${idx}]`;
          return mapper(name, idx);
        });
      },
    }),
    [],
  );

  useLayoutEffect(() => {
    const fieldArrayValues = get(getFormValues(), props.name);
    if (props.initLength) {
      times(props.initLength - size(fieldArrayValues), add);
    }
    return () => {};
  }, []);

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
