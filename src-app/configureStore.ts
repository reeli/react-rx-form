import { createStore, Middleware } from "redux";
import { createLogger } from "redux-logger";
import { rootReducer } from "./rootReducer";

const basicMiddlewares: Middleware[] = [];

if (process.env.NODE_ENV === "development") {
  const logger = createLogger({
    collapsed: true,
  });
  basicMiddlewares.push(logger);
}

export const configureStore = () => {
  return createStore(rootReducer, {});
};
