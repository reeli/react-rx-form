import FormControl from "@material-ui/core/FormControl/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText/FormHelperText";
import Input from "@material-ui/core/Input/Input";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";
import * as React from "react";

export const CustomInput = ({ name, value, error, onChange, placeholder, type }: any) => (
  <FormControl error={!!error}>
    <InputLabel htmlFor={name}>{name}</InputLabel>
    <Input
      name={name}
      value={value}
      onChange={(evt) => onChange(evt.target.value)}
      placeholder={placeholder}
      type={type}
    />
    {error && <FormHelperText>{error}</FormHelperText>}
  </FormControl>
);
