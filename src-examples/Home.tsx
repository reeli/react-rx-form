import * as React from "react";

export class Home extends React.Component {
  static tsc() {
    return require(`!!raw-loader!../src-examples/Home.tsx`);
  }

  static doc() {
    return require(`!raw-loader!markdown-loader!../README.md`);
  }

  render() {
    return null;
  }
}
