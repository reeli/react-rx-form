import { Field, RxForm } from "@react-rx/form";
import * as React from "react";
import { required } from "../guide/utils/validations";

const onlyNumber = (value: any) => {
  return value ? value.replace(/[^\d]/g, "") : value;
};

const between0And99 = (value: any) => {
  if (!value) {
    return;
  }
  return /^[0-9]{1,2}$/gi.test(value) ? undefined : "Number should between 0 and 99";
};

export class Normalizing extends React.Component {
  static tsc() {
    return require(`!!raw-loader!../examples/Normalizing.tsx`);
  }

  onSubmit = (values: any) => {
    alert(JSON.stringify(values, null, 2));
  };

  render() {
    return (
      <RxForm>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(this.onSubmit)}>
            <Field name="Age" normalize={onlyNumber} validate={[required(), between0And99]}>
              {({ value = "", onChange, onFocus, onBlur, name, meta: { error } }) => (
                <div>
                  <input
                    name={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={onFocus}
                    onBlur={(e) => onBlur(e.target.value)}
                    type="text"
                    placeholder="Type age integer"
                  />
                  {error && <div style={{ color: "red" }}>{error}</div>}
                </div>
              )}
            </Field>
            <button type="submit">Submit</button>
          </form>
        )}
      </RxForm>
    );
  }
}
