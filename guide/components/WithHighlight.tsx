import { highlightBlock } from "highlight.js";
import * as React from "react";
import { findDOMNode } from "react-dom";

export class WithHighlight extends React.Component {
  componentDidMount() {
    const current = findDOMNode(this) as HTMLElement;
    if (current) {
      highlightBlock(current);
    }
  }

  render() {
    return this.props.children;
  }
}
