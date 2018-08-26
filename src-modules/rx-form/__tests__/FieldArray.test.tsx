import { mount } from "enzyme";
import * as React from "react";
import { Field } from "../Field";
import { FieldArray } from "../FieldArray";
import { pickInputPropsFromFieldProps } from "../utils";

describe("<FieldArray/>", () => {
  it("add a field array item", () => {
    const instance = createFieldArray().instance() as any;
    instance.add();
    expect(instance.state).toEqual({ fields: ["members"] });
  });

  it("remove a field array item", () => {
    const instance = createFieldArray().instance() as any;
    instance.add();
    instance.add();
    instance.remove(0);
    expect(instance.state).toEqual({ fields: ["members"] });
  });
});

const createFieldArray = () =>
  mount(
    <FieldArray name={"members"}>
      {({ fields }) =>
        fields.map((member, idx) => (
          <Field name={`${member}.firstName`} key={idx}>
            {(fieldState) => <input type="text" {...pickInputPropsFromFieldProps(fieldState)} />}
          </Field>
        ))
      }
    </FieldArray>,
  );
