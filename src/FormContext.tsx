import { createContext } from "react";
import { IFormContextValue } from "./interfaces";

const { Provider, Consumer } = createContext<IFormContextValue>({
  subscribe: (_: any) => {},
  dispatch: (_: any) => {},
  subscribeFormAction: (_: any) => {},
  updateFormValues: (_: any) => {},
  getFormValues: () => ({}),
});

export { Provider as FormProvider, Consumer as FormConsumer };
