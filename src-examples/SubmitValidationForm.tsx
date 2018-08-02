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
  <FormControl error={!!error} aria-describedby="name-error-text">
    <InputLabel htmlFor="name-error">{name}</InputLabel>
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
    if (values.username === undefined) {
      onSubmitError({
        username: "not empty error",
      });
    }

    if (values.password === undefined) {
      onSubmitError({
        password: "login failed!",
      });
    }
  };

  render() {
    return (
      <RxForm onSubmit={this.handleSubmit}>
        {({ onSubmit }) => (
          <form onSubmit={onSubmit}>
            <Field name={"username"} component={DemoInput} value="" />
            <Field
              name={"password"}
              type={"password"}
              component={DemoInput}
              placeholder="type password here..."
              value=""
            />
            <Button type="submit">Submit</Button>
          </form>
        )}
      </RxForm>
    );
  }
}
