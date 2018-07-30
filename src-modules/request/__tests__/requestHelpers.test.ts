import { createRequestAction } from "../";

const requestMapper = ({ name, age }: { name: string; age: number }) => {
  return {
    method: "GET",
    url: "/mock-api",
    data: {
      name,
      age,
    },
  };
};
const requestActionCreator = createRequestAction("REQUEST_ACTION", requestMapper);
const requestAction = requestActionCreator({ name: "TW", age: 20 });

describe("requestHelpers", () => {
  it("#createRequestAction", () => {
    const expectedResult = {
      type: "REQUEST_ACTION",
      payload: {
        method: "GET",
        url: "/mock-api",
        data: {
          name: "TW",
          age: 20,
        },
      },
      meta: {
        request: true,
      },
    };

    expect(requestAction).toEqual(expectedResult);
    expect(requestActionCreator.toString()).toEqual("REQUEST_ACTION");
    expect(requestActionCreator.start.toString()).toEqual("REQUEST_ACTION_Start");
    expect(requestActionCreator.success.toString()).toEqual("REQUEST_ACTION_Success");
    expect(requestActionCreator.failed.toString()).toEqual("REQUEST_ACTION_Failed");
  });
});
