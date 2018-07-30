import { combineReducers } from "redux";
import { tempDataReducer } from "../src-modules/tempData/tempDataReducer";

export const rootReducer = combineReducers({
  tempData: tempDataReducer,
});
