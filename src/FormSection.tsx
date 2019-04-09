import React, { ReactNode, useContext } from "react";
import { FormContext, FormProvider } from "./FormContext";

interface IFormSectionProps {
  name: string;
  children: ReactNode;
}

export const FormSection = ({ name, children }: IFormSectionProps) => {
  const formContext = useContext(FormContext);
  return (
    <FormProvider
      value={{
        ...formContext,
        fieldPrefix: `${formContext.fieldPrefix || ""}${name}.`,
      }}
    >
      {children}
    </FormProvider>
  );
};
