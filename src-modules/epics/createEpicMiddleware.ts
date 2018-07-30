import { AnyAction, Dispatch, MiddlewareAPI } from "redux";
import { Observable } from "rxjs/internal/Observable";
import { merge } from "rxjs/internal/observable/merge";
import { Subject } from "rxjs/internal/Subject";

type TEpic = (action: Observable<any>) => Observable<any>;

export const combineEpics = (...epicsArr: TEpic[]) => {
  return (action$: Observable<any>) => {
    return merge(
      ...epicsArr.map((epic: TEpic) => {
        return epic(action$);
      }),
    );
  };
};

export const createEpicMiddleware = (epics: (rootSubject$: Observable<any>) => Observable<any>) => {
  const rootSubject$ = new Subject();

  return ({ dispatch }: MiddlewareAPI) => {
    return (next: Dispatch<AnyAction>) => {
      epics(rootSubject$).subscribe((action) => {
        dispatch(action);
      });
      return (action: any) => {
        if (action instanceof Subject) {
          return rootSubject$.subscribe(action);
        }
        const result = next(action);
        // 每一个 action 过来都往 rootSubject 发

        rootSubject$.next(action);
        return result;
      };
    };
  };
};
