import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { distinctUntilChanged, map, tap } from "rxjs/operators";
import { FormContext, IFormContextValue } from "./FormContext";
import { IFormState, IFormValues } from "./RxForm";
import { TChildrenRender } from "./types";
import { toFormValues } from "./utils";

export interface IFormValuesInnerProps {
  formValues: IFormValues;
  updateFormValues: IFormContextValue["updateFormValues"];
}

interface IFormValuesCoreState {
  formValues: IFormValues;
}

interface IFormValuesCommonProps {
  children: TChildrenRender<IFormValuesInnerProps>;
}

interface IFormValuesCoreWrapperProps extends IFormValuesCommonProps {
  forwardedRef?: React.Ref<any>;
}

interface IFormValuesCoreProps extends IFormValuesCommonProps {
  formContextValue: IFormContextValue;
  ref?: React.Ref<any>;
}

class FormValuesCore extends React.Component<IFormValuesCoreProps, IFormValuesCoreState> {
  subscription: Subscription | null = null;
  state = {
    formValues: {} as IFormValues,
  };

  componentDidMount() {
    const formStateObserver$ = new Subject<IFormState>();
    formStateObserver$
      .pipe(
        map((formState: IFormState) => {
          return toFormValues(formState);
        }),
        distinctUntilChanged(),
        tap((formValues: IFormValues) => {
          this.setState({
            formValues,
          });
        }),
      )
      .subscribe();
    this.subscription = this.props.formContextValue.subscribe(formStateObserver$);
  }

  getFormValues = () => {
    return toFormValues(this.state.formValues);
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
      updateFormValues: this.props.formContextValue.updateFormValues,
    });
  }
}

const FormValuesCoreWrapper = ({ forwardedRef, ...others }: IFormValuesCoreWrapperProps) => {
  return (
    <FormContext.Consumer>
      {(formContextValue) => {
        return <FormValuesCore formContextValue={formContextValue} {...others} ref={forwardedRef} />;
      }}
    </FormContext.Consumer>
  );
};

export const FormValues = React.forwardRef<React.Ref<any>, IFormValuesCommonProps>((props, ref) => {
  return <FormValuesCoreWrapper {...props} forwardedRef={ref} />;
});
