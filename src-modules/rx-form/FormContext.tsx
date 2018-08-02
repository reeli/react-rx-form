import { createContext } from "react";
import { Observer } from "rxjs/internal/types";
import { IFieldAction } from "./Field";

export interface IFormContextValue {
  dispatch: (fieldAction: IFieldAction) => any;
  subscribe: (observer: Observer<any>) => any;
  subscribeFormSubmit: (observer: Observer<any>) => any;
}

export const FormContext = createContext<IFormContextValue>({
  subscribe: (_: any) => {},
  dispatch: (_: any) => {},
  subscribeFormSubmit: (_: any) => {},
});
