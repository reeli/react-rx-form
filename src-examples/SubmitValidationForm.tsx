import Button from "@material-ui/core/Button/Button";
import FormControl from "@material-ui/core/FormControl/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText/FormHelperText";
import Input from "@material-ui/core/Input/Input";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import * as React from "react";
import { DispatchProp } from "react-redux";
import { Field } from "../src-modules/rx-form/Field";
import { RxForm } from "../src-modules/rx-form/RxForm";

interface IPageHomeProps extends DispatchProp {}

const DemoInput = ({ name, value, error, onChange, placeholder, type }: any) => (
  <FormControl error={!!error}>
    <InputLabel>{name}</InputLabel>
    <Input value={value} onChange={onChange} placeholder={placeholder} type={type} />
    {error && <FormHelperText>{error}</FormHelperText>}
  </FormControl>
);

export class SubmitValidationForm extends React.Component<IPageHomeProps> {
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

  handleSubmit = (values: any, onSubmitError: any) => {
    console.log(values, "values on Submit");
    const errors = {} as any;

    if (values.username.length === 0) {
      errors.username = "not empty error";
    }

    if (values.password.length === 0) {
      errors.password = "not empty error";
    }

    if (values.password.length >= 5) {
      errors.username = "Password must less that 5 digits!";
    }

    if (values.password.length <= 6 && values.password.length > 0) {
      errors.password = "Password must more that 6 digits!";
    }

    onSubmitError(errors);
  };

  render() {
    return (
      <RxForm onSubmit={this.handleSubmit}>
        {({ onSubmit }) => (
          <form onSubmit={onSubmit}>
            <Field name="username" value="">
              {(fieldProps) => <DemoInput {...fieldProps} type="text" placeholder="Username" />}
            </Field>
            <Field name="password" value="">
              {(fieldProps) => <DemoInput {...fieldProps} type="password" placeholder="Password" />}
            </Field>
            <Button type="submit">Submit</Button>
          </form>
        )}
      </RxForm>
    );
  }
}
