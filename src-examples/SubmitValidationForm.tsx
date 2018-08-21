import Button from "@material-ui/core/Button/Button";
import { isEmpty } from "lodash";
import * as React from "react";
import { CustomInput } from "../src-components/CustomInput";
import { Field } from "../src-modules/rx-form/Field";
import { RxForm } from "../src-modules/rx-form/RxForm";

export class SubmitValidationForm extends React.Component {
  button: any = null;

  state = {
    username: {
      value: "",
      error: [],
    },
    password: {
      value: "",
      error: [],
    },
  };

  onSubmit = (values: any, onSubmitError: any) => {
    console.log(values, "values on Submit");
    const errors = {} as any;

    if (values.username.length === 0) {
      errors.username = "not empty error";
    }

    if (values.password.length === 0) {
      errors.password = "not empty error";
    }

    if (values.username.length >= 5) {
      errors.username = "Password must less that 5 digits!";
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
              {(fieldProps) => <CustomInput {...fieldProps} type="text" placeholder="Username" />}
            </Field>
            <Field name="password" defaultValue="">
              {(fieldProps) => <CustomInput {...fieldProps} type="password" placeholder="Password" />}
            </Field>
            <Button type="submit">Submit</Button>
          </form>
        )}
      </RxForm>
    );
  }
}
