import { Suspense, lazy } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useParams, useRoutes } from "react-router-dom";

import { Bullseye, Spinner } from "@patternfly/react-core";

import { ErrorFallback } from "@app/components/ErrorFallback";

const Vulnerabilities = lazy(
  () => import("@static-report/pages/vulnerabilities"),
);

export const Paths = {} as const;

export enum PathParam {}

export const AppRoutes = () => {
  const allRoutes = useRoutes([{ path: "/", element: <Vulnerabilities /> }]);

  return (
    <Suspense
      fallback={
        <Bullseye>
          <Spinner />
        </Bullseye>
      }
    >
      <ErrorBoundary FallbackComponent={ErrorFallback} key={location.pathname}>
        {allRoutes}
      </ErrorBoundary>
    </Suspense>
  );
};

export const useRouteParams = (pathParam: PathParam) => {
  const params = useParams();
  const value = params[pathParam];
  if (value === undefined) {
    throw new Error(
      `ASSERTION FAILURE: required path parameter not set: ${pathParam}`,
    );
  }
  return value;
};
