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
      <RxForm onSubmit={this.handleSubmit}>
        {({ onSubmit }) => (
          <form onSubmit={onSubmit}>
            <Field name="firstName" type="text" component={DemoInput} value="" placeholder="First Name" />
            <Field name="lastName" type="text" placeholder="Last Name" value="" component={DemoInput} />
            <Field name="email" type="email" placeholder="Email" value="" component={DemoInput} />
            <Field name="sex" type="radio" placeholder="Sex" value="" component={DemoInput} />
            <Button type="submit">Submit</Button>
          </form>
        )}
      </RxForm>
    );
  }
}
