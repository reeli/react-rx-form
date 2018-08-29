import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { distinctUntilChanged, map, tap } from "rxjs/operators";
import { FormContext, IFormContextValue } from "./FormContext";
import { IFormState, IFormValues } from "./RxForm";
import { TChildrenRender } from "./types";
import { toFormValues } from "./utils";

interface IFormValuesInnerProps {
  formValues: IFormValues;
}

interface IFormValuesCoreState {
  formValues: IFormValues;
}

interface IFormValuesProps {
  children: TChildrenRender<IFormValuesInnerProps>;
}

interface IFormValuesCoreProps extends IFormValuesProps {
  formContextValue: IFormContextValue;
}

class FormValuesCore extends React.Component<IFormValuesCoreProps, IFormValuesCoreState> {
  state = {
    formValues: {} as IFormValues,
  };

  componentDidMount() {
    const formStateObserver$ = new Subject();
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
    this.props.formContextValue.subscribe(formStateObserver$);
  }

  render() {
    return this.props.children({
      formValues: this.state.formValues,
    });
  }
}

export class FormValues extends React.Component<IFormValuesProps> {
  render() {
    return (
      <FormContext.Consumer>
        {(formContextValue) => {
          return <FormValuesCore formContextValue={formContextValue} {...this.props} />;
        }}
      </FormContext.Consumer>
    );
  }
}
