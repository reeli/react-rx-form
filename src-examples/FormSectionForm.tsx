import { Field, FieldArray, RxForm } from "@react-rx/form";
import * as React from "react";
import { FormSection } from "../src/FormSection";

export class FormSectionForm extends React.Component {
  static tsc() {
    return require(`!!raw-loader!../src-examples/FormSectionForm.tsx`);
  }

  static doc() {
    return require(`!raw-loader!markdown-loader!../src-examples/FormSectionForm.md`);
  }

  onSubmit = (values: any) => {
    alert(JSON.stringify(values, null, 2));
  };

  renderFieldArray = (fieldName: string, idx: number) => {
    return (
      <Field name={fieldName} key={idx}>
        {({ value = "", name, onChange }) => (
          <input
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            type="password"
            placeholder="Last Name"
          />
        )}
      </Field>
    );
  };

  render() {
    return (
      <RxForm>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(this.onSubmit)}>
            <FormSection name={"username"}>
              <Field name="firstName">
                {({ value = "", onChange, name }) => (
                  <input
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    type="text"
                    placeholder="First Name"
                  />
                )}
              </Field>
              <Field name="lastName">
                {({ value = "", onChange, name }) => (
                  <input
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    type="password"
                    placeholder="Last Name"
                  />
                )}
              </Field>
            </FormSection>
            <FormSection name={"address"}>
              <FieldArray name={"location"} initLength={1}>
                {({ each }) => each(this.renderFieldArray)}
              </FieldArray>
            </FormSection>
            <button type="submit">Submit</button>
          </form>
        )}
      </RxForm>
    );
  }
}
