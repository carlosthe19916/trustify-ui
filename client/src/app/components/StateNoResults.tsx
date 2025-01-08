import React from "react";

import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Title,
} from "@patternfly/react-core";
import SearchIcon from "@patternfly/react-icons/dist/esm/icons/search-icon";

export const StateNoResults: React.FC = () => {
  return (
    <EmptyState
      titleText={
        <Title headingLevel="h2" size="lg">
          No results found
        </Title>
      }
      icon={SearchIcon}
      variant={EmptyStateVariant.sm}
    >
      <EmptyStateBody>
        No results match the filter criteria. Remove all filters or clear all
        filters to show results.
      </EmptyStateBody>
    </EmptyState>
  );
};
