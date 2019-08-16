import { Button } from "@material-ui/core";
import { Field, pickInputPropsFromFieldProps, RxForm } from "@react-rx/form";
import { CustomInput } from "guide/components/CustomInput";
import { isEmpty } from "lodash";
import * as React from "react";

export class SubmitValidationForm extends React.Component {
  static tsc() {
    return require(`!!raw-loader!../examples/SubmitValidationForm.tsx`);
  }

  onSubmit = (values: any, onSubmitError: any) => {
    const errors = {} as any;

    if (values.username.length === 0) {
      errors.username = "not empty error";
    }

    if (values.password.length === 0) {
      errors.password = "not empty error";
    }

    if (values.username.length >= 5) {
      errors.username = "Username must less that 5 digits!";
    }

    if (values.password.length <= 6 && values.password.length > 0) {
      errors.password = "Password must more that 6 digits!";
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
            <Field name="username" defaultValue="">
              {(fieldProps) => (
                <CustomInput {...pickInputPropsFromFieldProps(fieldProps)} type="text" placeholder="Username" />
              )}
            </Field>
            <Field name="password" defaultValue="">
              {(fieldProps) => (
                <CustomInput {...pickInputPropsFromFieldProps(fieldProps)} type="password" placeholder="Password" />
              )}
            </Field>
            <Button type="submit">Submit</Button>
          </form>
        )}
      </RxForm>
    );
  }
}
