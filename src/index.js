import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import React, { Fragment } from "react";
import { store, history } from "./store";

import { Route, Switch } from "react-router-dom";
import { ConnectedRouter } from "react-router-redux";

import App from "./components/App";
import ErrorsCollector from "./components/ErrorsCollector";

ReactDOM.render(
  <Fragment>
    <ErrorsCollector />
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route path="/" component={App} />
        </Switch>
      </ConnectedRouter>
    </Provider>
  </Fragment>,
  document.getElementById("root")
);
