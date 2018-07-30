import { assign } from "lodash";
import { Action } from "redux";

export interface IUpdateTempDataAction<TData> extends Action {
  payload: {
    data: TData;
  };
  meta: {
    groupKey: string;
  };
}

export function updateTempData<TData>(groupKey: string, data: TData): IUpdateTempDataAction<TData> {
  const type = `@@tempData/${updateTempData.name}`;
  assign(updateTempData, { toString: () => type });
  return {
    type,
    payload: {
      data,
    },
    meta: {
      groupKey,
    },
  };
}

export function removeTempData(groupKey: string) {
  const type = `@@tempData/${removeTempData.name}`;
  assign(removeTempData, { toString: () => type });
  return {
    type,
    meta: {
      groupKey,
    },
  };
}
