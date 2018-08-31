import { filter, map, times } from "lodash";
import * as React from "react";
import { FormValues, IFormValuesInnerProps } from "./FormValues";
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

interface IFieldArrayCoreProps extends IFieldArrayProps, IFormValuesInnerProps {}

class FieldArrayCore extends React.Component<IFieldArrayCoreProps, IFieldArrayCoreState> {
  state = {
    fields: [],
  };

  componentDidMount() {
    if (this.props.initLength) {
      times(this.props.initLength, this.add);
    }
  }

  remove = (idx: number) => {
    const nextFields = filter(this.state.fields, (_, n) => {
      return idx !== n;
    });

    // console.log(this.props.formValues, this.props.name);
    const nextItem = filter(this.props.formValues[this.props.name], (_, n: number) => {
      return n !== idx;
    });

    // console.log(nextItem, "---------");

    this.props.updateFormValues({
      ...this.props.formValues,
      [this.props.name]: nextItem,
    });

    this.setState({ fields: nextFields });
  };

  add = () => {
    const nextFields = [...this.state.fields, this.props.name];

    this.setState({
      fields: nextFields,
    });
  };

  formatFieldsByIdx = (fields: string[]) => {
    return map(fields, (field: string, idx: number) => `${field}[${idx}]`);
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
  <FormValues>
    {({ updateFormValues, formValues }) => (
      <FieldArrayCore {...props} formValues={formValues} updateFormValues={updateFormValues} />
    )}
  </FormValues>
);
