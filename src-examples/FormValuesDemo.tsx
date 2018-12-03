import { Field, FormValues, RxForm } from "@react-rx/form";
import * as React from "react";

export class FormValuesDemo extends React.Component {
  static tsc() {
    return require(`!!raw-loader!../src-examples/FormValuesDemo.tsx`);
  }

  onSubmit = (values: any) => {
    alert(JSON.stringify(values, null, 2));
  };

  render() {
    return (
      <RxForm>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(this.onSubmit)}>
            <FormValues>
              {({ formValues }) => (
                <>
                  <Field name="firstName">
                    {({ value = "", onChange, onFocus, onBlur, name }) => (
                      <input
                        name={name}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        type="text"
                        placeholder="First Name"
                      />
                    )}
                  </Field>
                  {formValues.firstName && (
                    <Field name="lastName" destroyValueOnUnmount={true}>
                      {({ value = "", onChange, onFocus, onBlur, name }) => (
                        <input
                          name={name}
                          value={value}
                          onChange={(e) => onChange(e.target.value)}
                          onFocus={onFocus}
                          onBlur={onBlur}
                          type="password"
                          placeholder="Last Name"
                        />
                      )}
                    </Field>
                  )}
                </>
              )}
            </FormValues>
            <Field name="email">
              {({ value = "", onFocus, onBlur, onChange }) => (
                <input
                  name={name}
                  value={value}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  onChange={onChange}
                  type="email"
                  placeholder="Email"
                />
              )}
            </Field>
            <Field name="checkbox" defaultValue={false}>
              {({ value = false, onBlur, onFocus, onChange, name }) => (
                <input
                  name={name}
                  value={value}
                  onChange={onChange}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  type={"checkbox"}
                  placeholder="Checkbox"
                />
              )}
            </Field>
            <div>
              <label>
                <Field name="sex">
                  {({ onChange, name, onBlur, onFocus }) => (
                    <input
                      name={name}
                      onFocus={onFocus}
                      onChange={onChange}
                      onBlur={onBlur}
                      type="radio"
                      value="male"
                    />
                  )}
                </Field>
                male
              </label>
              <label>
                <Field name="sex">
                  {({ onChange, name, onBlur, onFocus }) => (
                    <input
                      name={name}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      onChange={onChange}
                      type="radio"
                      value="female"
                    />
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
