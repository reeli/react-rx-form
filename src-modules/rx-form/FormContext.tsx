import { createContext } from "react";
import { Observer } from "rxjs/internal/types";
import { IFieldAction } from "./Field";

export interface IFormContext {
  dispatch: (fieldAction: IFieldAction) => any;
  subscribe: (observer: Observer<any>) => any;
  subscribeFormSubmit: (observer: Observer<any>) => any;
}

export const FormContext = createContext<IFormContext>({
  subscribe: (_: any) => {},
  dispatch: (_: any) => {},
  subscribeFormSubmit: (_: any) => {},
});
