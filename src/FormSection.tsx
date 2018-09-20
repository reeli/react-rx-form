import * as React from "react";
import { FormConsumer, FormProvider } from "./FormContext";
import { IFormSectionProps } from "./interfaces";

export const FormSection = ({ name, children }: { name: IFormSectionProps["name"]; children: React.ReactNode }) => {
  return (
    <FormConsumer>
      {(formContextValue) => {
        return (
          <FormProvider
            value={{
              ...formContextValue,
              fieldPrefix: `${formContextValue.fieldPrefix || ""}${name}.`,
            }}
          >
            {children}
          </FormProvider>
        );
      }}
    </FormConsumer>
  );
};
