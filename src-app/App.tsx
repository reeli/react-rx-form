import * as React from "react";
import { Provider } from "react-redux";
import { AppRoutes, Nav } from "./AppRoutes";
import { configureStore } from "./configureStore";

const store = configureStore();

export class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          <Nav />
          <div style={{ flex: 1 }}>
            <AppRoutes />
          </div>
        </div>
      </Provider>
    );
  }
}
