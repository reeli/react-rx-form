import Button from "@material-ui/core/Button/Button";
import { isEmpty } from "lodash";
import * as React from "react";
import { Field, FieldArray, pickInputPropsFromFieldProps, RxForm } from "src";
import { CustomInput } from "src-components/CustomInput";
import { required } from "src-modules/utils/validations";

export class FieldArrayForm extends React.Component {
  static tsc() {
    return require(`!!raw-loader!../src-examples/FieldArrayForm.tsx`);
  }

  onSubmit = (values: any, onSubmitError: any) => {
    if (isEmpty(values)) {
      return;
    }
    const errors = {} as any;
    if (values.members[0].firstName.length >= 5) {
      errors[`members[0].firstName`] = "Username must less that 5 digits!";
    }
    if (!isEmpty(errors)) {
      onSubmitError(errors);
    } else {
      alert(JSON.stringify(values, null, 2));
    }
  };

  renderHobbies = (member: any) => {
    return (
      <FieldArray name={`${member}.hobbies`}>
        {({ fields, add, remove }) => (
          <ul>
            <li>
              <button onClick={() => add()} type={"button"}>
                add hobbies
              </button>
            </li>
            {fields.map((hobby, idx) => (
              <div key={idx}>
                <Field name={hobby} validate={required()}>
                  {(fieldProps) => (
                    <CustomInput
                      {...pickInputPropsFromFieldProps(fieldProps)}
                      type="text"
                      placeholder={`hobby${idx}`}
                    />
                  )}
                </Field>
                <div onClick={() => remove(idx)}>remove</div>
              </div>
            ))}
          </ul>
        )}
      </FieldArray>
    );
  };

  render() {
    return (
      <RxForm initialValues={{ members: [{ firstName: "rui", lastName: "li" }] }}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(this.onSubmit)}>
            <FieldArray name={"members"} initLength={1}>
              {({ fields, add, remove }) => (
                <ul>
                  <li>
                    <button type="button" onClick={() => add()}>
                      Add member
                    </button>
                  </li>
                  {fields.map((member, idx) => (
                    <li key={member}>
                      <h3>{`member${idx + 1}`}</h3>
                      <Field name={`${member}.firstName`} validate={required()}>
                        {(fieldProps) => (
                          <CustomInput
                            {...pickInputPropsFromFieldProps(fieldProps)}
                            type="text"
                            placeholder={`First Name${idx}`}
                          />
                        )}
                      </Field>
                      <Field name={`${member}.lastName`} validate={required()}>
                        {(fieldProps) => (
                          <CustomInput
                            {...pickInputPropsFromFieldProps(fieldProps)}
                            type="password"
                            placeholder="Last Name"
                          />
                        )}
                      </Field>
                      <button type="button" onClick={() => remove(idx)}>
                        Remove members
                      </button>
                      {this.renderHobbies(member)}
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
