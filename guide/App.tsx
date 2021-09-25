import * as React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./AppRoutes";
import { Nav } from "./components/Nav";
import { configureStore } from "./configureStore";

const store = configureStore();

export class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          <BrowserRouter basename={"/react-rx-form"}>
            <>
              <Nav />
              <div style={{ flex: 1, marginLeft: 215 }}>
                <AppRoutes />
              </div>
            </>
          </BrowserRouter>
        </div>
      </Provider>
    );
  }
}
