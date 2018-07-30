import * as React from "react";
import { Provider } from "react-redux";
import { AppRouteConfig, Nav } from "./AppRouteConfig";
import { configureStore } from "./configureStore";

const store = configureStore();

export class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <>
          <AppRouteConfig />
          <Nav />
        </>
      </Provider>
    );
  }
}
