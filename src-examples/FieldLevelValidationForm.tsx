import Button from "@material-ui/core/Button/Button";
import FormControl from "@material-ui/core/FormControl/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText/FormHelperText";
import Input from "@material-ui/core/Input/Input";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import { isEmpty } from "lodash";
import * as React from "react";
import { DispatchProp } from "react-redux";
import { Field, TFieldValue } from "../src-modules/rx-form/Field";
import { RxForm } from "../src-modules/rx-form/RxForm";

interface IPageHomeProps extends DispatchProp {}

const DemoInput = ({ name, value, error, onChange, placeholder, type }: any) => (
  <FormControl error={!!error}>
    <InputLabel htmlFor={name}>{name}</InputLabel>
    <Input value={value} onChange={onChange} placeholder={placeholder} type={type} />
    {error && <FormHelperText>{error}</FormHelperText>}
  </FormControl>
);

const required = (value: TFieldValue) => {
  return isEmpty(value) ? "no empty value" : undefined;
};

const maxLength5 = (value: TFieldValue) => {
  return (value as string).length > 5 ? "value length must less than 5" : undefined;
};

export class FieldLevelValidationForm extends React.Component<IPageHomeProps> {
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
              {(fieldProps) => <DemoInput {...fieldProps} type="text" placeholder="type username here..." />}
            </Field>
            <Field name="password" validate={required} value="">
              {(fieldProps) => <DemoInput {...fieldProps} type="text" placeholder="type password here..." />}
            </Field>
            <Button type="submit">Submit</Button>
          </form>
        )}
      </RxForm>
    );
  }
}
