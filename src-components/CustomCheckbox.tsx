import Checkbox from "@material-ui/core/Checkbox/Checkbox";
import * as React from "react";

export const CustomCheckbox = ({ value, onChange }: any) => (
  <Checkbox checked={value} onChange={(evt) => onChange(evt.target.checked)} />
);
