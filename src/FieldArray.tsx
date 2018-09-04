import { filter, get, map, set, size, times } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { distinctUntilChanged, tap } from "rxjs/operators";
import { FormContext } from "./FormContext";
import { IFieldArrayCoreProps, IFieldArrayCoreState, IFieldArrayProps, IFormState } from "./interfaces";

class FieldArrayCore extends React.Component<IFieldArrayCoreProps, IFieldArrayCoreState> {
  state = {
    fields: [],
  };

  componentDidMount() {
    // TODO: Will form initial values in FieldArray
    if (this.props.initLength) {
      times(this.props.initLength, this.add);
    }
    const formStateObserver$ = new Subject<IFormState>();
    formStateObserver$
      .pipe(
        distinctUntilChanged(),
        tap(() => {
          const formValues = this.props.formContextValue.getFormValues();
          const len = size(get(formValues, this.props.name));
          if (len > 0) {
            this.setState({
              fields: get(formValues, this.props.name),
            });
          }
        }),
      )
      .subscribe();
    this.props.formContextValue.subscribe(formStateObserver$);
  }

  remove = (idx: number, { formContextValue: { getFormValues, updateFormValues } }: IFieldArrayCoreProps) => {
    // const nextFields = filter(this.state.fields, (_, n) => {
    //   return idx !== n;
    // });
    // console.log(this.props.formValues, this.props.name);
    const formValues = getFormValues();
    const newFieldArrayValues = filter(get(formValues, this.props.name), (_, n: number) => {
      return n !== idx;
    });

    const nextFormValues = set(formValues, this.props.name, newFieldArrayValues);
    updateFormValues(nextFormValues);

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
      remove: (idx: number) => this.remove(idx, this.props),
    });
  }
}

export const FieldArray = (props: IFieldArrayProps) => (
  <FormContext.Consumer>
    {(formContextValue) => <FieldArrayCore {...props} formContextValue={formContextValue} />}
  </FormContext.Consumer>
);
