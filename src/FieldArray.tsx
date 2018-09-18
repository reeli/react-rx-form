import { filter, get, map, set, size, times } from "lodash";
import * as React from "react";
import { FormContext } from "./FormContext";
import { IFieldArrayCoreProps, IFieldArrayCoreState, IFieldArrayProps } from "./interfaces";

class FieldArrayCore extends React.Component<IFieldArrayCoreProps, IFieldArrayCoreState> {
  componentDidMount() {
    const fieldArrayValues = get(this.props.getFormValues(), this.props.name);
    if (this.props.initLength) {
      times(this.props.initLength - size(fieldArrayValues), this.add);
    }
  }

  remove = (idx: number, { getFormValues, updateFormValues }: IFieldArrayCoreProps) => {
    const formValues = getFormValues();
    const newFieldArrayValues = filter(get(formValues, this.props.name), (_, n: number) => {
      return n !== idx;
    });

    const nextFormValues = set(formValues, this.props.name, newFieldArrayValues);
    updateFormValues(nextFormValues);
    this.forceUpdate();
  };

  add = () => {
    const formValues = this.props.getFormValues();
    const nextFormValues = set(formValues, this.props.name, get(formValues, this.props.name, []).concat(undefined));

    this.props.updateFormValues(nextFormValues);
    this.forceUpdate();
  };

  formatFieldsByIdx = (fields: any[]): string[] => {
    return map(fields, (_, idx: number) => `${this.props.name}[${idx}]`);
  };

  render() {
    return this.props.children({
      fields: this.formatFieldsByIdx(get(this.props.getFormValues(), this.props.name)),
      add: this.add,
      remove: (idx: number) => this.remove(idx, this.props),
    });
  }
}

export const FieldArray = (props: IFieldArrayProps) => (
  <FormContext.Consumer>
    {(formContextValue) => <FieldArrayCore {...props} {...formContextValue} />}
  </FormContext.Consumer>
);
