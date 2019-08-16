import { Button } from "@material-ui/core";
import { Field, FieldArray, RxForm } from "@react-rx/form";
import { required } from "guide/utils/validations";
import { isEmpty } from "lodash";
import * as React from "react";

export class FieldArrayForm extends React.Component {
  static tsc() {
    return require(`!raw-loader!../examples/FieldArrayForm.tsx`);
  }

  static doc() {
    return require(`!raw-loader!markdown-loader!../examples/FieldArrayForm.md`);
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
          <div style={{ marginTop: 15 }}>
            <div>
              <Button onClick={() => add()} type={"button"} variant={"outlined"}>
                add hobbies
              </Button>
            </div>
            {fields.map((hobby, idx) => (
              <div key={idx} style={{ marginTop: 15 }}>
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
                <Button onClick={() => remove(idx)} color={"secondary"} style={{ marginTop: 15 }}>
                  remove
                </Button>
              </div>
            ))}
          </div>
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
              {({ fields, add, remove }) => {
                return (
                  <div>
                    <div>
                      <Button type="button" onClick={() => add()} variant={"outlined"}>
                        Add member
                      </Button>
                    </div>
                    {fields.map((member, idx) => (
                      <div key={member}>
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
                        <Button type="button" onClick={() => remove(idx)} style={{ marginTop: 15 }} color={"secondary"}>
                          Remove members
                        </Button>
                        {this.renderHobbies(member)}
                      </div>
                    ))}
                  </div>
                );
              }}
            </FieldArray>
            <Button type="submit" variant={"outlined"} color={"primary"} style={{ marginTop: 15 }}>
              Submit
            </Button>
          </form>
        )}
      </RxForm>
    );
  }
}
