import Button from "@material-ui/core/Button/Button";
import FormControl from "@material-ui/core/FormControl/FormControl";
import * as React from "react";
import { CustomCheckbox } from "../src-components/CustomCheckbox";
import { CustomInput } from "../src-components/CustomInput";
import { Field } from "../src-modules/rx-form/Field";
import { RxForm } from "../src-modules/rx-form/RxForm";

export class SimpleForm extends React.Component {
  handleSubmit = (values: any) => {
    alert(JSON.stringify(values, null, 2));
  };

  render() {
    return (
      <RxForm
        onSubmit={this.handleSubmit}
        initialValues={{
          firstName: "rui",
          lastName: "li",
        }}
      >
        {({ onSubmit }) => (
          <form onSubmit={onSubmit}>
            <div>
              <Field name="firstName">
                {(fieldProps) => <CustomInput {...fieldProps} type="text" placeholder="First Name" />}
              </Field>
              <Field name="lastName">
                {(fieldProps) => <CustomInput {...fieldProps} type="password" placeholder="Last Name" />}
              </Field>
              <Field name="email">
                {(fieldProps) => <CustomInput {...fieldProps} type="email" placeholder="Email" />}
              </Field>
              <Field name="checkbox" value={false}>
                {(fieldProps) => <CustomCheckbox {...fieldProps} placeholder="Checkbox" />}
              </Field>
              <FormControl>
                <label>
                  <Field name="sex">{(fieldProps) => <CustomInput {...fieldProps} type="radio" />}</Field>
                  male
                </label>
                <label>
                  <Field name="sex" value="female">
                    {(fieldProps) => <CustomInput {...fieldProps} type="radio" />}
                  </Field>
                  female
                </label>
              </FormControl>
            </div>
            <Button type="submit">Submit</Button>
          </form>
        )}
      </RxForm>
    );
  }
}
