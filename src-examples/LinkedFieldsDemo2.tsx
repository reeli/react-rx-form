import Button from "@material-ui/core/Button/Button";
import { Field, pickInputPropsFromFieldProps, RxForm, WithForm } from "@react-rx/form";
import { isEmpty } from "lodash";
import * as React from "react";
import { CustomInput } from "src-components/CustomInput";

export class LinkedFieldsDemo2 extends React.Component {
  static tsc() {
    return require(`!!raw-loader!../src-examples/LinkedFieldsDemo2.tsx`);
  }

  onSubmit = (values: any, onSubmitError: any) => {
    const errors = {} as any;

    if (!values.username && !values.password) {
      errors.username = "You must enter either of the two fields.";
      errors.password = "You must enter either of the two fields.";
    }

    if (!isEmpty(errors)) {
      onSubmitError(errors);
    } else {
      alert("submit success");
    }
  };

  render() {
    return (
      <RxForm>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(this.onSubmit)}>
            <WithForm>
              {({ setErrors }) => (
                <>
                  <Field name="username" defaultValue="">
                    {(fieldProps) => (
                      <CustomInput
                        {...pickInputPropsFromFieldProps(fieldProps)}
                        type="text"
                        placeholder="Username"
                        onChange={(value: any) => {
                          if (value) {
                            setErrors({
                              password: undefined,
                            });
                          }
                          fieldProps.onChange(value);
                        }}
                      />
                    )}
                  </Field>
                  <Field name="password" defaultValue="">
                    {(fieldProps) => (
                      <CustomInput
                        {...pickInputPropsFromFieldProps(fieldProps)}
                        type="password"
                        placeholder="Password"
                        onChange={(value: any) => {
                          if (value) {
                            setErrors({
                              username: undefined,
                            });
                          }
                          fieldProps.onChange(value);
                        }}
                      />
                    )}
                  </Field>
                </>
              )}
            </WithForm>
            <Button type="submit">Submit</Button>
          </form>
        )}
      </RxForm>
    );
  }
}
