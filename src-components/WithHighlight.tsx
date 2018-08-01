import { highlightBlock } from "highlight.js";
import * as React from "react";
import { findDOMNode } from "react-dom";

export class WithHighlight extends React.Component {
  codeblock: any = null;

  componentDidMount() {
    const current = findDOMNode(this) as any;
    highlightBlock(current);
  }

  render() {
    return this.props.children;
  }
}
