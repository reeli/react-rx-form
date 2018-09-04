import Button from "@material-ui/core/Button/Button";
import FormControl from "@material-ui/core/FormControl/FormControl";
import * as React from "react";
import { Field, FormValues, RxForm } from "../src-modules/rx-form";
import { CustomCheckbox } from "./components/CustomCheckbox";
import { CustomInput } from "./components/CustomInput";

export class SimpleForm extends React.Component {
  static tsc() {
    return require(`!!raw-loader!../src-examples/SimpleForm.tsx`);
  }

  form: any;
  formValues: any;
  ref: any = React.createRef();
  onSubmit = (values: any) => {
    alert(JSON.stringify(values, null, 2));
  };

  componentDidMount() {
    console.log(this.form.getFormValues(), "this.form.formState");
    console.log(this.ref.current.getFormValues(), "this.formValues");
    setTimeout(() => {
      alert("hehaha");
    }, 2000);
  }

  render() {
    return (
      <RxForm
        initialValues={{ firstName: "rui", lastName: "li" }}
        ref={(ref: any) => {
          this.form = ref;
        }}
      >
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
              <FormValues ref={this.ref}>
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
