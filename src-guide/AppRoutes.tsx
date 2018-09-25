import AppBar from "@material-ui/core/AppBar/AppBar";
import Card from "@material-ui/core/Card/Card";
import CardContent from "@material-ui/core/CardContent/CardContent";
import CardHeader from "@material-ui/core/CardHeader/CardHeader";
import Toolbar from "@material-ui/core/Toolbar/Toolbar";
import Typography from "@material-ui/core/Typography/Typography";
import { map } from "lodash";
import * as React from "react";
import { Route } from "react-router";
import { GettingStart } from "../src-examples/GettingStart";
import { WithHighlight } from "./components/WithHighlight";

const PageComp = ({ Comp, pageName }: { Comp: any; pageName: string }) => (
  <React.Fragment>
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="title" color="inherit">
          {pageName}
        </Typography>
      </Toolbar>
    </AppBar>
    <Card elevation={0}>
      <CardHeader title={<Typography variant="title">Form</Typography>} />
      <CardContent>
        <Comp />
      </CardContent>
      <CardHeader title={<Typography variant="title">API</Typography>} />
      <CardContent>
        {Comp.doc && (
          <WithHighlight>
            <Typography component={"div"}>
              <div dangerouslySetInnerHTML={{ __html: Comp.doc() }} />
            </Typography>
          </WithHighlight>
        )}
      </CardContent>
      <CardHeader title={<Typography variant="title">Code</Typography>} />
      <CardContent>
        {Comp.tsc && (
          <WithHighlight>
            <pre>
              <code>{Comp.tsc()}</code>
            </pre>
          </WithHighlight>
        )}
      </CardContent>
    </Card>
  </React.Fragment>
);

export const req = (require as any).context("../src-examples", true, /\.tsx/);
let routes: any[] = [];
req.keys().forEach((key: string) => {
  const module = req(key);

  const route = {
    path: key.split(".")[1],
    component: () =>
      map(module, (Comp, i) => {
        const pageName = key.split(".")[1].split("/")[1];
        return <PageComp Comp={Comp} pageName={pageName} key={i} />;
      }),
  };

  routes = routes.concat(route);
});

const HomePage = () => {
  return <PageComp Comp={GettingStart} pageName={"GettingStart"} />;
};

export const AppRoutes = () => {
  return (
    <div>
      <Route path={"/"} component={HomePage} i={"GettingStart"} exact />
      {routes.map((route, i) => (
        <Route key={i} {...route} />
      ))}
    </div>
  );
};
