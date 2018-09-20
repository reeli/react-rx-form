import { Field, RxForm } from "@reeli/react-rx-form";
import * as React from "react";

export class SimpleForm extends React.Component {
  static tsc() {
    return require(`!!raw-loader!../src-examples/SimpleForm.tsx`);
  }

  onSubmit = (values: any) => {
    alert(JSON.stringify(values, null, 2));
  };

  render() {
    return (
      <RxForm>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(this.onSubmit)}>
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
            <Field name="email">
              {({ value = "", onChange }) => (
                <input
                  name={name}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  type="email"
                  placeholder="Email"
                />
              )}
            </Field>
            <Field name="checkbox" defaultValue={false}>
              {({ value = false, onChange, name }) => (
                <input
                  name={name}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  type={"checkbox"}
                  placeholder="Checkbox"
                />
              )}
            </Field>
            <div>
              <label>
                <Field name="sex">
                  {({ onChange, name }) => (
                    <input name={name} onChange={(e) => onChange(e.target.value)} type="radio" value="male" />
                  )}
                </Field>
                male
              </label>
              <label>
                <Field name="sex">
                  {({ onChange, name }) => (
                    <input name={name} onChange={(e) => onChange(e.target.value)} type="radio" value="female" />
                  )}
                </Field>
                female
              </label>
            </div>
            <button type="submit">Submit</button>
          </form>
        )}
      </RxForm>
    );
  }
}
