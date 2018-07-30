import { updateTempData } from "../actions";

describe("tempData actions", () => {
  it("#updateTempData", () => {
    const groupName = "test";
    const data = 10;
    expect(updateTempData(groupName, data)).toEqual({
      type: `${updateTempData}`,
      meta: {
        groupKey: "test",
      },
      payload: {
        data: 10,
      },
    });
  });
});
