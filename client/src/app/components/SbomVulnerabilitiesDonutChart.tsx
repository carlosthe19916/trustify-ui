import React from "react";

import { ChartDonut } from "@patternfly/react-charts";

import { compareBySeverityFn, severityList } from "@app/api/model-utils";
import { Severity } from "@app/client";
import { VulnerabilityOfSbomSummary } from "@app/hooks/domain-controls/useVulnerabilitiesOfSbom";

export interface SbomVulnerabilitiesDonutChartProps {
  vulnerabilitiesSummary: VulnerabilityOfSbomSummary;
}

export const SbomVulnerabilitiesDonutChart: React.FC<
  SbomVulnerabilitiesDonutChartProps
> = ({ vulnerabilitiesSummary }) => {
  const donutChart = React.useMemo(() => {
    return Object.keys(vulnerabilitiesSummary.severities)
      .map((item) => {
        const severity = item as Severity;
        const count = vulnerabilitiesSummary.severities[severity];
        const severityProps = severityList[severity];
        return {
          severity,
          count,
          label: severityProps.name,
          color: severityProps.color.value,
        };
      })
      .sort(compareBySeverityFn((item) => item.severity));
  }, [vulnerabilitiesSummary]);

  return (
    <div style={{ height: "230px", maxWidth: "350px" }}>
      <ChartDonut
        constrainToVisibleArea
        legendOrientation="vertical"
        legendPosition="right"
        padding={{
          bottom: 20,
          left: 20,
          right: 140,
          top: 20,
        }}
        title={`${vulnerabilitiesSummary.total}`}
        subTitle="Total vulnerabilities"
        width={350}
        legendData={donutChart.map(({ label, count }) => ({
          name: `${label}: ${count}`,
        }))}
        data={donutChart.map(({ label, count }) => ({
          x: label,
          y: count,
        }))}
        labels={({ datum }) => `${datum.x}: ${datum.y}`}
        colorScale={donutChart.map(({ color }) => color)}
      />
    </div>
  );
};