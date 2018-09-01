import { filter, map, size } from "lodash";
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
  fields: any[];
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
            this.setState({
              fields: formValues[this.props.name],
            });
          }
          console.log(formValues, "formValues");
        }),
      )
      .subscribe();
    this.props.formContextValue.subscribe(formStateObserver$);
  }

  remove = (idx: number) => {
    // const nextFields = filter(this.state.fields, (_, n) => {
    //   return idx !== n;
    // });
    // console.log(this.props.formValues, this.props.name);
    const formValues = this.props.formContextValue.getFormValues();
    const newFieldArrayValues = filter(formValues[this.props.name], (_, n: number) => {
      return n !== idx;
    });
    console.log(formValues, newFieldArrayValues, "0");
    // console.log(nextItem, "---------");
    //
    this.props.formContextValue.updateFormValues({
      ...formValues,
      [this.props.name]: newFieldArrayValues,
    });

    // this.setState({ fields: newFieldArrayValues.length });
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
