import createBrowserHistory from "history/createBrowserHistory";
import * as React from "react";
import { Provider } from "react-redux";
import { Router } from "react-router";
import { AppRoutes } from "./AppRoutes";
import { Nav } from "./components/Nav";
import { configureStore } from "./configureStore";

const store = configureStore();
const history = createBrowserHistory();

export class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          <Router history={history}>
            <>
              <Nav />
              <div style={{ flex: 1, marginLeft: 210 }}>
                <AppRoutes />
              </div>
            </>
          </Router>
        </div>
      </Provider>
    );
  }
}
