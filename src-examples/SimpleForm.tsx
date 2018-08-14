import Button from "@material-ui/core/Button/Button";
import FormControl from "@material-ui/core/FormControl/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText/FormHelperText";
import Input from "@material-ui/core/Input/Input";
import * as React from "react";
import { DispatchProp } from "react-redux";
import { Field } from "../src-modules/rx-form/Field";
import { RxForm } from "../src-modules/rx-form/RxForm";

interface IPageHomeProps extends DispatchProp {}

const DemoInput = ({ name, value, error, onChange, placeholder, type }: any) => {
  return (
    <FormControl error={!!error}>
      <Input value={value} onChange={onChange} placeholder={placeholder} type={type} name={name} />
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export class SimpleForm extends React.Component<IPageHomeProps> {
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
                {(fieldProps) => <DemoInput {...fieldProps} type="text" placeholder="First Name" />}
              </Field>
              <Field name="lastName">
                {(fieldProps) => <DemoInput {...fieldProps} type="password" placeholder="Last Name" />}
              </Field>
              <Field name="email">
                {(fieldProps) => <DemoInput {...fieldProps} type="email" placeholder="Email" />}
              </Field>
              <FormControl>
                <label>
                  <Field name="sex">{(fieldProps) => <DemoInput {...fieldProps} type="radio" />}</Field>
                  male
                </label>
                <label>
                  <Field name="sex" value="female">
                    {(fieldProps) => <DemoInput {...fieldProps} type="radio" />}
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
