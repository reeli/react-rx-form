import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { createRequestAction, createRequestMiddleware } from "../";
import { MiddlewareTestHelper } from "../../../test/helpers/MiddlewareTestHelper";

const mockAxios = axios.create({
  baseURL: "",
  timeout: 0,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

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

describe("#createRequestMiddleware", () => {
  it("async start action should be called with correct data", () => {
    const mock = new MockAdapter(mockAxios) as any;
    mock
      .onGet("/mock-api")
      .reply(200)
      .onAny()
      .reply(500);

    const mockClient = mock.axiosInstance;
    const { store, invoke$ } = MiddlewareTestHelper.of(createRequestMiddleware(mockClient)).create();
    const expectedResult = {
      type: "REQUEST_ACTION_Start",
      meta: {
        previousAction: {
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
        },
      },
    };

    invoke$(requestAction);
    expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
  });

  it("async success action should be called with correct data when fetch succeed", () => {
    const mock = new MockAdapter(mockAxios) as any;

    mock
      .onGet("/mock-api")
      .reply(200, {
        email: "test@test.com",
        address: "Chengdu",
      })
      .onAny()
      .reply(500);

    const mockClient = mock.axiosInstance;
    const { store, invoke$ } = MiddlewareTestHelper.of(createRequestMiddleware(mockClient)).create();

    invoke$(requestAction).subscribe(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "REQUEST_ACTION_Success",
        }),
      );
      expect(store.dispatch).toHaveBeenCalledTimes(2);
    });
  });

  it("async failed action should be called with correct data when fetch failed", () => {
    const mock = new MockAdapter(mockAxios) as any;

    mock
      .onGet("/mock-api")
      .reply(400, {
        errorMessage: "This is an error",
      })
      .onAny()
      .reply(500);

    const mockClient = mock.axiosInstance;
    const { store, invoke$ } = MiddlewareTestHelper.of(createRequestMiddleware(mockClient)).create();

    invoke$(requestAction).subscribe(
      () => {},
      () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "REQUEST_ACTION_Failed",
          }),
        );
        expect(store.dispatch).toHaveBeenCalledTimes(2);
      },
    );
  });
});
