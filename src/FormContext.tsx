import { createContext } from "react";
import { IFormContextValue, IFormState } from "./interfaces";

const FormContext = createContext<IFormContextValue>({
  subscribe: (_: any) => {},
  dispatch: (_: any) => {},
  subscribeFormAction: (_: any) => {},
  updateFormValues: (_: any) => {},
  getFormValues: () => ({}),
  getFormState: () => ({} as IFormState),
  setErrors: (_: any) => {},
});

const { Provider, Consumer } = FormContext;

export { Provider as FormProvider, Consumer as FormConsumer, FormContext };
