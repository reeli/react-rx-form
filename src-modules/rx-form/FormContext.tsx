import { createContext } from "react";
import { Observer } from "rxjs/internal/types";
import { IFieldAction } from "./Field";
import { IFormValues } from "./RxForm";

export interface IFormContextValue {
  dispatch: (fieldAction: IFieldAction) => any;
  subscribe: (observer: Observer<any>) => any;
  subscribeFormAction: (observer: Observer<any>) => any;
  updateFormValues: (formValues: IFormValues) => any;
}

export const FormContext = createContext<IFormContextValue>({
  subscribe: (_: any) => {},
  dispatch: (_: any) => {},
  subscribeFormAction: (_: any) => {},
  updateFormValues: (_: any) => {},
});
