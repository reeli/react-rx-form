import Button from "@material-ui/core/Button/Button";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import Select from "@material-ui/core/Select/Select";
import TextField from "@material-ui/core/TextField/TextField";
import * as React from "react";
import { CustomInput } from "../src-components/CustomInput";
import { Field, pickInputPropsFromFieldProps, RxForm } from "../src-modules/rx-form";
import { maxLength5, required } from "../src-modules/utils/validations";

export class FieldLevelValidationForm extends React.Component {
  onSubmit = () => {};

  render() {
    return (
      <RxForm
      // initialValues={{
      //   username: "hello",
      //   password: "123456",
      // }}
      >
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(this.onSubmit)}>
            <Field name="username" validate={[required(), maxLength5()]}>
              {(fieldProps) => (
                <CustomInput
                  {...pickInputPropsFromFieldProps(fieldProps)}
                  type="text"
                  placeholder="type username here..."
                />
              )}
            </Field>
            <Field name="password" validate={required()}>
              {(fieldProps) => (
                <CustomInput
                  {...pickInputPropsFromFieldProps(fieldProps)}
                  type="text"
                  placeholder="type password here..."
                />
              )}
            </Field>
            <Field name="feedbackDate" validate={required()} defaultValue="2017-05-24">
              {({ name, value, onChange, meta: { error } }) => (
                <TextField
                  label="Feedback Date"
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={(evt) => onChange(evt.target.value)}
                  name={name}
                  value={value}
                  error={!!error}
                />
              )}
            </Field>
            <Field name="mode" defaultValue={10}>
              {({ onChange, meta: { error }, ...others }) => (
                <Select
                  {...others}
                  onChange={(evt) => onChange(evt.target.value)}
                  placeholder="Mode of Feedback"
                  error={!!error}
                >
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              )}
            </Field>
            <Button type="submit">Submit</Button>
          </form>
        )}
      </RxForm>
    );
  }
}
