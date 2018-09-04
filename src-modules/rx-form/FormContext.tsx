import { createContext } from "react";
import { IFormContextValue } from "./interface";

export const FormContext = createContext<IFormContextValue>({
  subscribe: (_: any) => {},
  dispatch: (_: any) => {},
  subscribeFormAction: (_: any) => {},
  updateFormValues: (_: any) => {},
  getFormValues: () => ({}),
});
