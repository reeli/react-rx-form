import Button from "@material-ui/core/Button/Button";
import * as React from "react";
import { CustomInput } from "../src-components/CustomInput";
import { Field } from "../src-modules/rx-form/Field";
import { FieldArray } from "../src-modules/rx-form/FieldArray";
import { RxForm } from "../src-modules/rx-form/RxForm";

export class FieldArrayForm extends React.Component {
  onSubmit = (values: any) => {
    alert(JSON.stringify(values, null, 2));
  };

  render() {
    return (
      <RxForm>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(this.onSubmit)}>
            <FieldArray name={"members"}>
              {({ fields, add, remove }) => (
                <ul>
                  <li>
                    <button type="button" onClick={() => add()}>
                      Add member
                    </button>
                  </li>
                  {fields.map((member, idx) => (
                    <li key={idx}>
                      <h3>{`member${idx + 1}`}</h3>
                      <Field name={`${member}.firstName`}>
                        {(fieldProps) => <CustomInput {...fieldProps} type="text" placeholder={`First Name${idx}`} />}
                      </Field>
                      <Field name={`${member}.lastName`}>
                        {(fieldProps) => <CustomInput {...fieldProps} type="password" placeholder="Last Name" />}
                      </Field>
                      <button type="button" onClick={() => remove(idx)}>
                        Remove Hobby
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </FieldArray>
            <Button type="submit">Submit</Button>
          </form>
        )}
      </RxForm>
    );
  }
}
