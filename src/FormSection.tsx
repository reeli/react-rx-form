import React, { cloneElement, Component, isValidElement } from "react";
import { FormConsumer } from "./FormContext";
import { IFieldProps, IFormSectionProps } from "./interfaces";

class FormSectionCore extends Component<IFormSectionProps> {
  render() {
    return React.Children.map(this.props.children, (child) => {
      const name = `${this.props.name}.${(child as any).props.name}` as string;
      return isValidElement(child)
        ? cloneElement(child, {
            ...child.props,
            name,
          } as IFieldProps)
        : null;
    });
  }
}

export const FormSection = React.forwardRef((props: { name: IFormSectionProps["name"] }, ref?: React.Ref<any>) => {
  return (
    <FormConsumer>
      {(formContextValue) => {
        return <FormSectionCore formContextValue={formContextValue} {...props} ref={ref} />;
      }}
    </FormConsumer>
  );
});
