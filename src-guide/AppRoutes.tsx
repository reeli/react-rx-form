import Typography from "@material-ui/core/Typography/Typography";
import { map } from "lodash";
import * as React from "react";
import { Route } from "react-router";
import { WithHighlight } from "./components/WithHighlight";

export const req = (require as any).context("../src-examples", true, /\.tsx/);
let routes: any[] = [];
req.keys().forEach((key: string) => {
  const module = req(key);

  const route = {
    path: key.split(".")[1],
    component: () =>
      map(module, (Comp, i) => {
        return (
          <React.Fragment key={i}>
            <Typography variant="title">Form</Typography>
            <Comp />
            <Typography variant="title">API</Typography>
            {Comp.doc && (
              <WithHighlight>
                <div dangerouslySetInnerHTML={{ __html: Comp.doc() }} />
              </WithHighlight>
            )}
            <Typography variant="title">Code</Typography>
            {Comp.tsc && (
              <WithHighlight>
                <pre>
                  <code>{Comp.tsc()}</code>
                </pre>
              </WithHighlight>
            )}
          </React.Fragment>
        );
      }),
  };

  routes = routes.concat(route);
});

export const AppRoutes = () => {
  return (
    <div>
      {routes.map((route, i) => (
        <Route key={i} {...route} />
      ))}
    </div>
  );
};
