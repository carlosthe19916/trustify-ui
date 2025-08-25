import React from "react";

import {createRoot} from "react-dom/client";
import "@app/dayjs";
import {StateNoData} from "@app/components/StateNoData.tsx";

const container = document.getElementById("root");

// biome-ignore lint/style/noNonNullAssertion: container must exist
const root = createRoot(container!);

const renderApp = () => {
  return root.render(
    <React.StrictMode>
      <StateNoData />
    </React.StrictMode>,
  );
};

renderApp();

