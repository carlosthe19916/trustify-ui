import type * as React from "react";

import type { AxiosError } from "axios";

import {
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  Grid,
  GridItem,
} from "@patternfly/react-core";

import { VulnerabilityGallery } from "@app/components/VulnerabilityGallery";
import type { VulnerabilityOfSbomSummary } from "@app/hooks/domain-controls/useVulnerabilitiesOfSbom";

interface IVulnerabilityMetricsProps {
  summary: VulnerabilityOfSbomSummary;
  isFetching: boolean;
  fetchError?: AxiosError;
}

export const VulnerabilityMetrics: React.FC<IVulnerabilityMetricsProps> = ({
  summary,
}) => {
  return (
    <Grid hasGutter>
      <GridItem md={4}>
        <Card>
          <CardTitle>
            <Bullseye>Total vulnerabilities</Bullseye>
          </CardTitle>
          <CardBody>
            <Bullseye>{summary.vulnerabilityStatus.affected.total}</Bullseye>
          </CardBody>
        </Card>
      </GridItem>
      <GridItem md={4}>
        <Card>
          <CardTitle>
            <Bullseye>Affected packages</Bullseye>
          </CardTitle>
          <CardBody>
            <Bullseye>{summary.vulnerabilityStatus.affected.total}</Bullseye>
          </CardBody>
        </Card>
      </GridItem>
      <GridItem md={4}>
        <Card>
          <CardTitle>
            <Bullseye>Vulnerabilities by severity</Bullseye>
          </CardTitle>
          <CardBody>
            <Bullseye>
              <VulnerabilityGallery
                severities={summary.vulnerabilityStatus.affected.severities}
              />
            </Bullseye>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};
