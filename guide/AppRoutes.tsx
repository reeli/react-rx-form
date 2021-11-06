import AppBar from "@material-ui/core/AppBar/AppBar";
import Card from "@material-ui/core/Card/Card";
import CardContent from "@material-ui/core/CardContent/CardContent";
import CardHeader from "@material-ui/core/CardHeader/CardHeader";
import Toolbar from "@material-ui/core/Toolbar/Toolbar";
import Typography from "@material-ui/core/Typography/Typography";
import { map } from "lodash";
import * as React from "react";
import { Redirect, Route } from "react-router-dom";
import { WithHighlight } from "./components/WithHighlight";

const PageComp = ({ Comp, pageName }: { Comp: any; pageName: string }) => {
  return (
    <>
      <AppBar position="sticky" style={{ background: "#3f51b5", color: "#fff" }}>
        <Toolbar>
          <Typography variant="h6">{pageName}</Typography>
        </Toolbar>
      </AppBar>
      <Card elevation={0}>
        <CardHeader title={<Typography variant="subtitle1">Form</Typography>} />
        <CardContent>
          <Comp />
        </CardContent>
        <CardContent>
          {Comp.doc && (
            <WithHighlight>
              <Typography component={"div"}>
                <div dangerouslySetInnerHTML={{ __html: Comp.doc().default }} />
              </Typography>
            </WithHighlight>
          )}
        </CardContent>
        <CardHeader title={<Typography variant="subtitle1">Code</Typography>} />
        <CardContent>
          {Comp.tsc && (
            <WithHighlight>
              <pre>
                <code>{Comp.tsc().default}</code>
              </pre>
            </WithHighlight>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export const req = (require as any).context("../examples", true, /\.tsx/);
let routes: any[] = [];
req.keys().forEach((key: string) => {
  const module = req(key);

  const route = {
    path: key.split(".")[1],
    component: () => {
      return (
        <>
          {map(module, (Comp, i) => {
            const pageName = key.split(".")[1].split("/")[1];
            return <PageComp Comp={Comp} pageName={pageName} key={i} />;
          })}
        </>
      );
    },
  };

  routes = routes.concat(route);
});

export const AppRoutes = () => {
  return (
    <div>
      <Redirect from={"/"} to={"/SimpleForm"}  exact />
      {routes.map((route, i) => (
        <Route key={i} {...route} />
      ))}
    </div>
  );
};
