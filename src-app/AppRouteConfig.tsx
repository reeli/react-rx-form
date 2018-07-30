import createBrowserHistory from "history/createBrowserHistory";
import * as React from "react";
import { Route, Router } from "react-router";
import { PageHome } from "./home/PageHome";

const history = createBrowserHistory();

const routes = [
  {
    path: "/",
    component: PageHome,
  },
];

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
