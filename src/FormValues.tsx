import { isEqual } from "lodash";
import { useContext, useLayoutEffect, useState } from "react";
import { distinctUntilChanged, map, tap } from "rxjs/operators";
import { FormContext } from "./FormContext";
import { IFormContextValue, IFormState, IFormValues, TChildrenRender } from "./interfaces";
import { Subject, Subscription } from "rxjs";

interface IFormValuesInnerProps {
  formValues: IFormValues;
  updateFormValues: IFormContextValue["updateFormValues"];
}

interface IFormValuesProps {
  children: TChildrenRender<IFormValuesInnerProps>;
}

export function FormValues(props: IFormValuesProps) {
  const { updateFormValues, getFormValues, subscribe } = useContext(FormContext);
  const defaultFormValues = getFormValues() as IFormValues;
  const [formValues, setFormValues] = useState(defaultFormValues);

  useLayoutEffect(() => {
    let subscription: Subscription | null = null;

    const formStateObserver$ = new Subject<IFormState>();
    formStateObserver$
      .pipe(
        map((formState: IFormState) => ({
          ...formState.values,
        })),
        distinctUntilChanged(isEqual),
        tap((values: IFormValues) => setFormValues(values)),
      )
      .subscribe();

    subscription = subscribe(formStateObserver$);

    return () => {
      if (subscription) {
        subscription.unsubscribe();
        subscription = null;
      }
    };
  }, []);

  return props.children({
    formValues,
    updateFormValues,
  });
}
