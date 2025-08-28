import type React from "react";
import { HashRouter as Router } from "react-router-dom";

import { AppRoutes } from "./Routes";
import { NotificationsProvider } from "@app/components/NotificationsContext";
import { DefaultLayout } from "@static-report/layout";

import "@patternfly/patternfly/patternfly.css";
import "@patternfly/patternfly/patternfly-addons.css";

const App: React.FC = () => {
  return (
    <Router>
      <NotificationsProvider>
        <DefaultLayout>
          <AppRoutes />
        </DefaultLayout>
      </NotificationsProvider>
    </Router>
  );
};

export default App;
