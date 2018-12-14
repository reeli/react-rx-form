import { isEqual } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { distinctUntilChanged, map, tap } from "rxjs/operators";
import { FormConsumer } from "./FormContext";
import {
  IFormState,
  IFormValues,
  IFormValuesCommonProps,
  IFormValuesCoreProps,
  IFormValuesCoreState,
} from "./interfaces";

class FormValuesCore extends React.Component<IFormValuesCoreProps, IFormValuesCoreState> {
  subscription: Subscription | null = null;
  state = {
    formValues: this.props.getFormValues() as IFormValues,
  };

  componentDidMount() {
    const formStateObserver$ = new Subject<IFormState>();
    formStateObserver$
      .pipe(
        map((formState: IFormState) => ({
          ...formState.values,
        })),
        distinctUntilChanged(isEqual),
        tap((formValues: IFormValues) => {
          this.setState({
            formValues,
          });
        }),
      )
      .subscribe();
    this.subscription = this.props.subscribe(formStateObserver$);
  }

  getFormValues = () => {
    return this.state.formValues;
  };

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  render() {
    return this.props.children({
      formValues: this.state.formValues,
      updateFormValues: this.props.updateFormValues,
    });
  }
}

export const FormValues = React.forwardRef((props: IFormValuesCommonProps, ref?: React.Ref<any>) => {
  return (
    <FormConsumer>
      {(formContextValue) => {
        return <FormValuesCore {...formContextValue} {...props} ref={ref} />;
      }}
    </FormConsumer>
  );
});
