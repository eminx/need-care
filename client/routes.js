import React from 'react';
import { Switch, Router, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import Layout from './containers/Layout';
import AccountManagerContainer from './containers/AccountManagerContainer';
import AddNeedContainer from './containers/AddNeedContainer';
import MyNeedsContainer from './containers/MyNeedsContainer';
import MyNeedContainer from './containers/MyNeedContainer';
import FindContainer from './containers/FindContainer';
import NeedDetailTobeCared from './containers/NeedDetailTobeCared';
import CaresList from './containers/CaresList';
import CareContainer from './containers/CareContainer';
import ProfileContainer from './containers/ProfileContainer';
import IntroContainer from './containers/IntroContainer';

const browserHistory = createBrowserHistory();

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Switch>
      <Layout history={browserHistory}>
        <Route exact path="/" component={AccountManagerContainer} />
        <Route exact path="/add" component={AddNeedContainer} />
        <Route exact path="/myneeds" component={MyNeedsContainer} />
        <Route exact path="/myneed/:id" component={MyNeedContainer} />

        <Route exact path="/discover" component={FindContainer} />
        <Route exact path="/need/:id" component={NeedDetailTobeCared} />

        <Route exact path="/messages" component={CaresList} />
        <Route exact path="/care/:id" component={CareContainer} />

        <Route exact path="/profile" component={ProfileContainer} />
        <Route exact path="/intro" component={IntroContainer} />
      </Layout>
    </Switch>
  </Router>
);
