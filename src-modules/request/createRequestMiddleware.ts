import { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { AnyAction, Dispatch, MiddlewareAPI } from "redux";
import { fromPromise } from "rxjs/internal-compatibility";
import { Observable } from "rxjs/internal/Observable";
import { of } from "rxjs/internal/observable/of";
import { catchError, filter, map, mergeMap } from "rxjs/operators";
import {
  createRequestFailedAction,
  createRequestStartAction,
  createRequestSuccessAction,
  isRequestAction,
} from "./requestHelpers";

export const createRequestMiddleware = (axiosInstance: AxiosInstance) => {
  return ({ dispatch }: MiddlewareAPI) => {
    return (next: Dispatch<AnyAction>) => {
      return (action: any) => {
        if (isRequestAction(action)) {
          dispatch(createRequestStartAction(action));
          const request$ = fromPromise(axiosInstance.request(action.payload));
          const subscription$ = request$.subscribe(
            (response: AxiosResponse) => {
              dispatch(createRequestSuccessAction(action, response));
              subscription$.unsubscribe();
            },
            (error: AxiosError) => {
              dispatch(createRequestFailedAction(action, error));
              subscription$.unsubscribe();
            },
          );
          return request$ as Observable<any>;
        }
        return next(action);
      };
    };
  };
};

export const createRequestEpic = (axiosInstance: AxiosInstance) => {
  return (input$: Observable<any>) => {
    return input$.pipe(
      filter((action) => isRequestAction(action)),
      mergeMap((action) =>
        fromPromise(axiosInstance.request(action.payload)).pipe(
          map((response: AxiosResponse) => createRequestSuccessAction(action, response)),
          catchError((error: AxiosError) => of(createRequestFailedAction(action, error))),
        ),
      ),
    );
  };
};
