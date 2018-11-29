import { Field, IFormState, RxForm, WithForm } from "@react-rx/form";
import { get } from "lodash";
import * as React from "react";

const createValidate = (formState: IFormState) => {
  if (get(formState, "fields.username.touched") && get(formState, "fields.password.touched")) {
    return formState.values.username || formState.values.password ? undefined : "You must enter each of fields.";
  }
  return;
};

export class LinkedFieldsDemo extends React.Component {
  static tsc() {
    return require(`!!raw-loader!../src-examples/LinkedFieldsDemo.tsx`);
  }

  onSubmit = (values: any) => {
    alert(JSON.stringify(values, null, 2));
  };

  render() {
    return (
      <RxForm>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(this.onSubmit)}>
            <WithForm>
              {({ getFormState }) => (
                <>
                  <Field
                    name="username"
                    validate={() => {
                      return createValidate(getFormState());
                    }}
                  >
                    {({ name, value = "", meta: { error }, onChange }) => {
                      return (
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
                      );
                    }}
                  </Field>
                  <Field
                    name="password"
                    validate={() => {
                      return createValidate(getFormState());
                    }}
                  >
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
                </>
              )}
            </WithForm>
            <button type="submit">Submit</button>
          </form>
        )}
      </RxForm>
    );
  }
}
