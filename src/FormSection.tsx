import * as React from "react";
import { IFormSectionProps } from "./__types__/interfaces";
import { FormConsumer, FormProvider } from "./FormContext";

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
