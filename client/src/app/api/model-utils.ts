import type React from "react";

import type { ProgressProps } from "@patternfly/react-core";
import {
  SeverityCriticalIcon,
  SeverityImportantIcon,
  SeverityMinorIcon,
  SeverityModerateIcon,
  SeverityNoneIcon,
  SeverityUndefinedIcon,
} from "@patternfly/react-icons";
import {
  t_global_icon_color_severity_critical_default as criticalColor,
  t_global_icon_color_severity_important_default as importantColor,
  t_global_icon_color_severity_minor_default as minorColor,
  t_global_icon_color_severity_moderate_default as moderateColor,
  t_global_icon_color_severity_none_default as noneColor,
  t_global_icon_color_severity_undefined_default as undefinedColor,
} from "@patternfly/react-tokens";

import type { ExtendedSeverity, Label } from "./models";

type ListType = {
  [key in ExtendedSeverity]: {
    name: string;
    color: { name: string; value: string; var: string };
    progressProps: Pick<ProgressProps, "variant">;

    // biome-ignore lint/suspicious/noExplicitAny: allowed
    icon: React.ComponentType<any>;
  };
};

export const severityList: ListType = {
  unknown: {
    name: "Unknown",
    color: undefinedColor,
    progressProps: { variant: undefined },
    icon: SeverityUndefinedIcon,
  },
  none: {
    name: "None",
    color: noneColor,
    progressProps: { variant: undefined },
    icon: SeverityNoneIcon,
  },
  low: {
    name: "Low",
    color: minorColor,
    progressProps: { variant: undefined },
    icon: SeverityMinorIcon,
  },
  medium: {
    name: "Medium",
    color: moderateColor,
    progressProps: { variant: "warning" },
    icon: SeverityModerateIcon,
  },
  high: {
    name: "High",
    color: importantColor,
    progressProps: { variant: "danger" },
    icon: SeverityImportantIcon,
  },
  critical: {
    name: "Critical",
    color: criticalColor,
    progressProps: { variant: "danger" },
    icon: SeverityCriticalIcon,
  },
};

export const getSeverityPriority = (val: ExtendedSeverity) => {
  switch (val) {
    case "unknown":
      return 1;
    case "none":
      return 2;
    case "low":
      return 3;
    case "medium":
      return 4;
    case "high":
      return 5;
    case "critical":
      return 6;
    default:
      return 0;
  }
};

export function compareBySeverityFn<T>(
  severityExtractor: (elem: T) => ExtendedSeverity,
) {
  return (a: T, b: T) => {
    return (
      getSeverityPriority(severityExtractor(a)) -
      getSeverityPriority(severityExtractor(b))
    );
  };
}

export const joinKeyValueAsString = ({ key, value }: Label): string => {
  return `${value ? `${key}=${value}` : `${key}`}`;
};

export const splitStringAsKeyValue = (v: string): Label => {
  const [key, value] = v.split("=");
  return { key, value: value ?? "" };
};
