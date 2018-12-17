import * as React from "react";

interface IWithDidMountProps {
  onDidMount: () => void;
}

export class WithDidMount extends React.Component<IWithDidMountProps> {
  componentDidMount() {
    this.props.onDidMount();
  }

  render() {
    return null;
  }
}
