import axios, { AxiosInstance } from "axios";
import { applyMiddleware, createStore, Middleware } from "redux";
import { createLogger } from "redux-logger";
import { combineEpics, createEpicMiddleware } from "../src-modules/epics/createEpicMiddleware";
import { createRequestEpic } from "../src-modules/request";
import { rootReducer } from "./rootReducer";

const client: AxiosInstance = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
});

const basicMiddlewares: Middleware[] = [];

if (process.env.NODE_ENV === "development") {
  const logger = createLogger({
    collapsed: true,
  });
  basicMiddlewares.push(logger);
}

export const configureStore = () => {
  return createStore(
    rootReducer,
    {},
    applyMiddleware(...[createEpicMiddleware(combineEpics(createRequestEpic(client)))]),
  );
};
