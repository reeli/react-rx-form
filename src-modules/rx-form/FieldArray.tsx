import { filter, map, times } from "lodash";
import * as React from "react";
import { TChildrenRender } from "./types";

interface IFieldArrayInnerProps extends IFieldArrayState {
  add: () => any;
  remove: (idx: number) => any;
}

interface IFieldArrayProps {
  name: string;
  children: TChildrenRender<IFieldArrayInnerProps>;
  initLength?: number;
}

interface IFieldArrayState {
  fields: string[];
}

export class FieldArray extends React.Component<IFieldArrayProps, IFieldArrayState> {
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
