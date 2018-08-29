import Button from "@material-ui/core/Button/Button";
import FormControl from "@material-ui/core/FormControl/FormControl";
import * as React from "react";
import { CustomCheckbox } from "../src-components/CustomCheckbox";
import { CustomInput } from "../src-components/CustomInput";
import { Field } from "../src-modules/rx-form/Field";
import { FormValues } from "../src-modules/rx-form/FormValues";
import { RxForm } from "../src-modules/rx-form/RxForm";

export class SimpleForm extends React.Component {
  onSubmit = (values: any) => {
    alert(JSON.stringify(values, null, 2));
  };

  render() {
    return (
      <RxForm initialValues={{ firstName: "rui", lastName: "li" }}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(this.onSubmit)}>
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
              <FormValues>
                {({ formValues }) => (
                  <>
                    <div>{JSON.stringify(formValues)}</div>
                    <Field name="checkbox" defaultValue={false}>
                      {(fieldProps) => <CustomCheckbox {...fieldProps} placeholder="Checkbox" />}
                    </Field>
                  </>
                )}
              </FormValues>
              <FormControl>
                <label>
                  <Field name="sex">{(fieldProps) => <CustomInput {...fieldProps} type="radio" value="male" />}</Field>
                  male
                </label>
                <label>
                  <Field name="sex">
                    {(fieldProps) => <CustomInput {...fieldProps} type="radio" value="female" />}
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
