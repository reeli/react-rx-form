import * as React from "react";

export class GettingStart extends React.Component {
  static tsc() {
    return require(`!!raw-loader!../src-examples/GettingStart.tsx`);
  }

  static doc() {
    return require(`!raw-loader!markdown-loader!../README.md`);
  }

  render() {
    return null;
  }
}
