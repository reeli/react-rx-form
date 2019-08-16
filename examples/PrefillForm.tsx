import { Button, FormControl } from "@material-ui/core";
import { Field, FormValues, RxForm } from "@react-rx/form";
import { CustomCheckbox } from "guide/components/CustomCheckbox";
import { CustomInput } from "guide/components/CustomInput";
import React from "react";
import { DebounceInput } from "../guide/components/DebounceInput";
import { required } from "../guide/utils/validations";

export class PrefillForm extends React.Component {
  static tsc() {
    return require(`!!raw-loader!../examples/PrefillForm.tsx`);
  }

  form: any;
  onSubmit = (values: any) => {
    alert(JSON.stringify(values, null, 2));
  };

  componentDidMount() {
    // setTimeout(() => {
    //   alert("hehaha");
    // }, 2000);
  }

  render() {
    return (
      <RxForm initialValues={{ firstName: "rui", lastName: "li" }}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(this.onSubmit)}>
            <div>
              <Field name="firstName" validate={required()}>
                {(fieldProps) => <DebounceInput {...fieldProps} type="text" placeholder="First Name" />}
              </Field>
              <Field name="lastName">
                {(fieldProps) => <CustomInput {...fieldProps} type="password" placeholder="Last Name" />}
              </Field>
              <Field name="email">
                {(fieldProps) => <CustomInput {...fieldProps} type="email" placeholder="Email" />}
              </Field>
              <FormValues>
                {({ formValues, updateFormValues }) => (
                  <>
                    <div>{JSON.stringify(formValues)}</div>
                    <div
                      onClick={() => {
                        updateFormValues({
                          checkbox: true,
                        });
                      }}
                    >
                      remove
                    </div>
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
