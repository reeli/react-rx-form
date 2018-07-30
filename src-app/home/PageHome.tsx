import AppBar from "@material-ui/core/AppBar/AppBar";
import Button from "@material-ui/core/Button/Button";
import FormControl from "@material-ui/core/FormControl/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText/FormHelperText";
import IconButton from "@material-ui/core/IconButton/IconButton";
import Input from "@material-ui/core/Input/Input";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import Toolbar from "@material-ui/core/Toolbar/Toolbar";
import Typography from "@material-ui/core/Typography/Typography";
import MenuIcon from "@material-ui/icons/Menu";
import * as config from "config";
// import { isEmpty, reduce } from "lodash";
import * as React from "react";
import { DispatchProp } from "react-redux";
import { Field } from "../../src-modules/rx-form/Field";
import { RxForm } from "../../src-modules/rx-form/RxForm";

interface IPageHomeProps extends DispatchProp {}

const DemoInput = ({ name, value, error, onChange, placeholder, type }: any) => (
  <FormControl error={!!error} aria-describedby="name-error-text">
    <InputLabel htmlFor="name-error">{name}</InputLabel>
    <Input value={value} onChange={onChange} placeholder={placeholder} type={type} />
    {error && <FormHelperText>{error}</FormHelperText>}
  </FormControl>
);

// const required = (value: string) => {
//   return isEmpty(value) ? "no empty value" : undefined;
// };
//
// const maxLength5 = (value: string) => {
//   return value.length > 5 ? "value length must less than 5" : undefined;
// };
//
// const compose = (validators: any) => {
//   return (value: string) => {
//     return reduce(
//       validators,
//       (error: string | undefined, validator) => {
//         return !error ? validator(value) : error;
//       },
//       undefined,
//     );
//   };
// };

export class PageHome extends React.Component<IPageHomeProps> {
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
    if (values.username === undefined || values.password === undefined) {
      onSubmitError({
        username: "not empty error",
        password: "login failed!",
      });
    }
  };

  render() {
    return (
      <div>
        <AppBar position="static" color="default">
          <Toolbar>
            <IconButton color="inherit" aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="title" color="inherit">
              MSF
            </Typography>
          </Toolbar>
        </AppBar>
        <div>{(config as any).NETWORK_ENV}</div>
        <RxForm onSubmit={this.handleSubmit}>
          {({ onSubmit }) => (
            <form onSubmit={onSubmit}>
              <Field name={"username"} component={DemoInput} />
              <Field name={"password"} type={"password"} component={DemoInput} placeholder="type password here..." />
              <Button type="submit">Submit</Button>
            </form>
          )}
        </RxForm>
        <button
          ref={(ref: any) => {
            this.button = ref;
          }}
        >
          this is a button
        </button>
      </div>
    );
  }
}
