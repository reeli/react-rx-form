import { combineReducers } from "redux";

const demoReducer = (state = {}) => {
  return state;
};

export const rootReducer = combineReducers({
  demo: demoReducer,
});
