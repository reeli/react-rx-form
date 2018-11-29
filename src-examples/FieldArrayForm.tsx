import Button from "@material-ui/core/Button/Button";
import { Field, FieldArray, RxForm } from "@react-rx/form";
import { isEmpty } from "lodash";
import * as React from "react";
import { required } from "src-modules/utils/validations";

export class FieldArrayForm extends React.Component {
  static tsc() {
    return require(`!raw-loader!../src-examples/FieldArrayForm.tsx`);
  }

  static doc() {
    return require(`!raw-loader!markdown-loader!../src-examples/FieldArrayForm.md`);
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
                  {({ name, value = "", onChange, meta: { error } }) => (
                    <div>
                      <input
                        name={name}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        type="text"
                        placeholder={`hobby${idx}`}
                      />
                      {error && <div style={{ color: "red" }}>{error}</div>}
                    </div>
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
                        {({ name, value = "", onChange, meta: { error } }) => (
                          <div>
                            <input
                              name={name}
                              value={value}
                              onChange={(e) => onChange(e.target.value)}
                              type="text"
                              placeholder={`First Name${idx}`}
                            />
                            {error && <div style={{ color: "red" }}>{error}</div>}
                          </div>
                        )}
                      </Field>
                      <Field name={`${member}.lastName`} validate={required()}>
                        {({ name, value = "", onChange, meta: { error } }) => (
                          <div>
                            <input
                              name={name}
                              value={value}
                              onChange={(e) => onChange(e.target.value)}
                              type="text"
                              placeholder="Last Name"
                            />
                            {error && <div style={{ color: "red" }}>{error}</div>}
                          </div>
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
