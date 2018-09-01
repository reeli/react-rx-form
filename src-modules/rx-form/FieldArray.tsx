import { map, size, times } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { distinctUntilChanged, tap } from "rxjs/operators";
import { FormContext, IFormContextValue } from "./FormContext";
import { IFormState } from "./RxForm";
import { TChildrenRender } from "./types";

interface IFieldArrayInnerProps extends IFieldArrayCoreState {
  add: () => any;
  remove: (idx: number) => any;
}

interface IFieldArrayProps {
  name: string;
  children: TChildrenRender<IFieldArrayInnerProps>;
  initLength?: number;
}

interface IFieldArrayCoreState {
  fields: string[];
}

interface IFieldArrayCoreProps extends IFieldArrayProps {
  formContextValue: IFormContextValue;
}

class FieldArrayCore extends React.Component<IFieldArrayCoreProps, IFieldArrayCoreState> {
  state = {
    fields: [],
  };

  componentDidMount() {
    // TODO: Will form initial values in FieldArray
    // if (this.props.initLength) {
    //   times(this.props.initLength, this.add);
    // }
    const formStateObserver$ = new Subject<IFormState>();
    formStateObserver$
      .pipe(
        distinctUntilChanged(),
        tap(() => {
          const formValues = this.props.formContextValue.getFormValues();
          const len = size(formValues[this.props.name]);
          if (len > 0) {
            times(len, this.add);
          }
          console.log(formValues, "formValues");
        }),
      )
      .subscribe();
    this.props.formContextValue.subscribe(formStateObserver$);
  }

  remove = (_: number) => {
    // const nextFields = filter(this.state.fields, (_, n) => {
    //   return idx !== n;
    // });
    // console.log(this.props.formValues, this.props.name);
    // const newFieldArrayValues = filter(this.props.formValues[this.props.name], (_, n: number) => {
    //   return n !== idx;
    // });
    // console.log(nextItem, "---------");
    //
    // this.props.updateFormValues({
    //   ...this.props.formValues,
    //   [this.props.name]: newFieldArrayValues,
    // });
    // this.setState({ fields: nextFields });
  };

  add = () => {
    const nextFields = [...this.state.fields, this.props.name];
    // this.props.updateFormValues({
    //   ...this.props.formValues,
    //   [this.props.name]: nextItem,
    // });
    this.setState({
      fields: nextFields,
    });
  };

  formatFieldsByIdx = (fields: any[]): string[] => {
    return map(fields, (_, idx: number) => `${this.props.name}[${idx}]`);
  };

  render() {
    return this.props.children({
      fields: this.formatFieldsByIdx(this.state.fields),
      add: this.add,
      remove: this.remove,
    });
  }
}

export const FieldArray = (props: IFieldArrayProps) => (
  <FormContext.Consumer>
    {(formContextValue) => <FieldArrayCore {...props} formContextValue={formContextValue} />}
  </FormContext.Consumer>
);
