import { maxLength5, required } from "../../utils/validations";
import { combine } from "../utils";

describe("#combine", () => {
  it("should get error message when combine validators with error", () => {
    const validators = [required(), maxLength5()];
    expect(combine(validators)("test data")).toEqual("defaultValue length must less than 5");
  });
  it("should get undefined when combine validators without error", () => {
    const validators = [required(), maxLength5()];
    expect(combine(validators)("test")).toEqual(undefined);
  });
});
