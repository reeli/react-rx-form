import { Field, RxForm } from "@react-rx/form";
import * as React from "react";
import { maxLength5, required } from "../src-modules/utils/validations";

export class FieldLevelValidationForm extends React.Component {
  static tsc() {
    return require(`!!raw-loader!../src-examples/FieldLevelValidationForm.tsx`);
  }

  onSubmit = (values: any) => {
    alert(JSON.stringify(values, null, 2));
  };

  render() {
    return (
      <RxForm>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(this.onSubmit)}>
            <Field name="username" validate={[required(), maxLength5()]}>
              {({ name, value = "", meta: { error }, onChange }) => (
                <div>
                  <input
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    type="text"
                    placeholder="Username"
                  />
                  {error && <div style={{ color: "red" }}>{error}</div>}
                </div>
              )}
            </Field>
            <Field name="password" validate={required()}>
              {({ name, value = "", meta: { error }, onChange }) => (
                <div>
                  <input
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    type="password"
                    placeholder="Password"
                  />
                  {error && <div style={{ color: "red" }}>{error}</div>}
                </div>
              )}
            </Field>
            <button type="submit">Submit</button>
          </form>
        )}
      </RxForm>
    );
  }
}
