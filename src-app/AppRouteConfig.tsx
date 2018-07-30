import createBrowserHistory from "history/createBrowserHistory";
import { map } from "lodash";
import * as React from "react";
import { Route, Router } from "react-router";

const history = createBrowserHistory();

const req = (require as any).context("../src-examples", true, /\.tsx/);

let routes: any[] = [];
req.keys().forEach((key: string) => {
  const module = req(key);

  const route = {
    path: key.split(".")[1],
    component: () =>
      map(module, (Comp, i) => {
        return <Comp key={i} />;
      }),
  };
  routes = routes.concat(route);
});

export const Nav = () => {
  return (
    <>
      {req.keys().map((key: string) => {
        const path = key.split(".")[1];
        return (
          <div key={key}>
            <a href={path}>{path}</a>
          </div>
        );
      })}
    </>
  );
};

export const AppRouteConfig = () => {
  return (
    <Router history={history}>
      <div>
        {routes.map((route, i) => (
          <Route key={i} {...route} />
        ))}
      </div>
    </Router>
  );
};
