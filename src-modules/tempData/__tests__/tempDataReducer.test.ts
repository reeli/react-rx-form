import { updateTempData } from "../actions";
import { tempDataReducer } from "../tempDataReducer";

describe("tempDataReducer", () => {
  it("should return the initial state", () => {
    expect(tempDataReducer(undefined, updateTempData("test", {}))).toEqual({ test: {} });
  });

  it("should handle updateTempData", () => {
    expect(
      tempDataReducer(
        {},
        updateTempData("groupKey", {
          name: "Rui",
          age: "10",
        }),
      ),
    ).toEqual({ groupKey: { name: "Rui", age: "10" } });
  });
});
