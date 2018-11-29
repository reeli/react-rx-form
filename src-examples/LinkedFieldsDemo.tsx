import { dropEmpty, Field, IFormState, RxForm, WithForm } from "@react-rx/form";
import { get, isEmpty, isEqual } from "lodash";
import * as React from "react";
import { tap } from "rxjs/operators";
import { FormStateObservable } from "../src-components/FormStateObservable";

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
            <Field name="username">
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
            <Field name="password">
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
            <WithForm>
              {({ setErrors }) => (
                <FormStateObservable>
                  {(s$) => {
                    let prevErrors: any = {};

                    return s$.pipe(
                      tap((formState) => {
                        const errors = dropEmpty({
                          username: createValidate(formState),
                          password: createValidate(formState),
                        });

                        if ((!!prevErrors.username || !!prevErrors.password) && isEmpty(errors)) {
                          prevErrors = errors;
                          setErrors({
                            username: undefined,
                            password: undefined,
                          });
                        }

                        if ((!!errors.username || !!errors.password) && !isEqual(errors, prevErrors)) {
                          prevErrors = errors;
                          setErrors(errors);
                        }
                        prevErrors = errors;
                      }),
                    );
                  }}
                </FormStateObservable>
              )}
            </WithForm>
            <button type="submit">Submit</button>
          </form>
        )}
      </RxForm>
    );
  }
}
