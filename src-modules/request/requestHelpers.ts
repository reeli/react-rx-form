import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { assign } from "lodash";
import { Action } from "redux";

export interface IRequestAction extends Action {
  meta: {
    request: true;
  };
  payload: AxiosRequestConfig;
}

interface IRequestStartAction extends Action {
  meta: {
    previousAction: IRequestAction;
  };
}

export interface IRequestSuccessAction extends Action {
  payload: AxiosResponse;
  meta: {
    previousAction: IRequestAction;
  };
}

interface IRequestFailedAction extends Action {
  error: true;
  payload: AxiosError;
  meta: {
    previousAction: IRequestAction;
  };
}

interface IToString {
  toString: () => string;
}

interface IRequestHelpers extends IToString {
  start: IToString;
  success: IToString;
  failed: IToString;
}

const createStartActionType = (type: string) => `${type}_Start`;
const createSuccessActionType = (type: string) => `${type}_Success`;
const createFailedActionType = (type: string) => `${type}_Failed`;

const createRequestActionHelpers = (actionType: string): IRequestHelpers => {
  return {
    toString: () => actionType,
    start: {
      toString: () => createStartActionType(actionType),
    },
    success: {
      toString: () => createSuccessActionType(actionType),
    },
    failed: {
      toString: () => createFailedActionType(actionType),
    },
  };
};

export function createRequestAction<TReq>(type: string, reqConfigCreator: (req: TReq) => AxiosRequestConfig) {
  const actionCreator = (req?: TReq): IRequestAction => {
    return {
      type,
      meta: {
        request: true,
      },
      payload: reqConfigCreator(req || ({} as TReq)),
    };
  };
  return assign(actionCreator, createRequestActionHelpers(type));
}

export const createRequestStartAction = (action: IRequestAction): IRequestStartAction => {
  return {
    type: createStartActionType(action.type),
    meta: {
      previousAction: action,
    },
  };
};

export const createRequestSuccessAction = (action: IRequestAction, response: AxiosResponse): IRequestSuccessAction => {
  return {
    type: createSuccessActionType(action.type),
    payload: response,
    meta: {
      previousAction: action,
    },
  };
};

export const createRequestFailedAction = (action: IRequestAction, error: AxiosError): IRequestFailedAction => {
  return {
    type: createFailedActionType(action.type),
    error: true,
    payload: error,
    meta: {
      previousAction: action,
    },
  };
};

export const isRequestAction = (action: IRequestAction) => action.meta && action.meta.request;
