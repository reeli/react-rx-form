import { Field, RxForm } from "@react-rx/form";
import * as React from "react";

export class Format extends React.Component {
  static tsc() {
    return require(`!!raw-loader!../src-examples/Format.tsx`);
  }

  static doc() {
    return require(`!raw-loader!markdown-loader!../src-examples/Field.md`);
  }

  onSubmit = (values: any) => {
    alert(JSON.stringify(values, null, 2));
  };

  render() {
    return (
      <RxForm>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(this.onSubmit)}>
            <Field
              name="firstName"
              format={(value) => {
                return value ? `${value}.` : value;
              }}
              parse={(value) => {
                return value ? value.replace(/\./g, "") : value;
              }}
            >
              {({ value = "", onChange, onFocus, onBlur, name }) => (
                <input
                  name={name}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onFocus={onFocus}
                  onBlur={(e) => onBlur(e.target.value)}
                  type="text"
                  placeholder="First Name"
                />
              )}
            </Field>
            <button type="submit">Submit</button>
          </form>
        )}
      </RxForm>
    );
  }
}
