import Button from "@material-ui/core/Button/Button";
import * as React from "react";
import { CustomInput } from "../src-components/CustomInput";
import { Field } from "../src-modules/rx-form/Field";
import { RxForm } from "../src-modules/rx-form/RxForm";
import { maxLength5, required } from "../src-modules/utils/validations";

export class FieldLevelValidationForm extends React.Component {
  handleSubmit = () => {};

  render() {
    return (
      <RxForm
        onSubmit={this.handleSubmit}
        initialValues={{
          username: "hello",
          password: "123456",
        }}
      >
        {({ onSubmit }) => (
          <form onSubmit={onSubmit}>
            <Field name="username" validate={[required, maxLength5]} value="">
              {(fieldProps) => <CustomInput {...fieldProps} type="text" placeholder="type username here..." />}
            </Field>
            <Field name="password" validate={required} value="">
              {(fieldProps) => <CustomInput {...fieldProps} type="text" placeholder="type password here..." />}
            </Field>
            <Button type="submit">Submit</Button>
          </form>
        )}
      </RxForm>
    );
  }
}
