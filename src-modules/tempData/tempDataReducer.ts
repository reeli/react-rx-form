import { omit } from "lodash";
import { IUpdateTempDataAction, removeTempData, updateTempData } from "./actions";

export const tempDataReducer = (state: any = {}, action: IUpdateTempDataAction<any>) => {
  if (action.type === `${updateTempData}`) {
    return {
      ...state,
      [action.meta.groupKey]: action.payload.data,
    };
  }
  if (action.type === `${removeTempData}`) {
    return omit(state, action.meta.groupKey);
  }
  return state;
};
