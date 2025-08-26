import type React from "react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Content,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  MenuToggle,
  type MenuToggleElement,
  PageSection,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from "@patternfly/react-core";

import ExclamationCircleIcon from "@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon";
import InProgressIcon from "@patternfly/react-icons/dist/esm/icons/in-progress-icon";

import type { ExtractResult } from "@app/client";
import { useUploadAndAnalyzeSBOM } from "@app/queries/sboms-analysis";
import { Paths } from "@app/Routes";

import { useVulnerabilitiesOfSbomByPurls } from "@static-report/hooks/useVulnerabilitiesOfSbom";
import { VulnerabilityMetrics } from "@static-report/pages/vulnerabilities/components/VulnerabilitiesMetrics";
import { VulnerabilityTable } from "@static-report/pages/vulnerabilities/components/VulnerabilityTable";

import { UploadFileForAnalysis } from "./components/UploadFileForAnalysis";

export const SbomScan: React.FC = () => {
  // Actions dropdown
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);

  const handleActionsDropdownToggle = () => {
    setIsActionsDropdownOpen(!isActionsDropdownOpen);
  };

  // Upload handlers
  const [uploadResponseData, setUploadResponseData] =
    useState<ExtractResult | null>(null);

  const { uploads, handleUpload, handleCancelUpload, handleRemoveUpload } =
    useUploadAndAnalyzeSBOM((extractedData, _file) => {
      setUploadResponseData(extractedData);
    });

  // Post Upload handlers
  const allPurls = useMemo(() => {
    return Object.entries(uploadResponseData?.packages ?? {}).flatMap(
      ([_packageName, { purls }]) => {
        return purls;
      },
    );
  }, [uploadResponseData]);

  const {
    data: { vulnerabilities, summary },
    isFetching,
    fetchError,
  } = useVulnerabilitiesOfSbomByPurls(allPurls);

  // Other actions

  const scanAnotherFile = () => {
    for (const file of uploads.keys()) {
      handleRemoveUpload(file);
    }

    setUploadResponseData(null);
  };

  return (
    <>
      <PageSection type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={Paths.sboms}>SBOMs</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>
            Generate vulnerability report
          </BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection>
        {uploadResponseData === null || isFetching || fetchError ? (
          <Content>
            <Content component="h1">Generate vulnerability report</Content>
            <Content component="p">
              Select an SBOM file to generate a temporary vulnerability report.
              The file and report will not be saved.
            </Content>
          </Content>
        ) : (
          <Split>
            <SplitItem isFilled>
              <Content>
                <Content component="h1">Vulnerability report</Content>
                <Content component="p">
                  This is a temporary vulnerability report.
                </Content>
              </Content>
            </SplitItem>
            <SplitItem>
              <Dropdown
                isOpen={isActionsDropdownOpen}
                onSelect={() => setIsActionsDropdownOpen(false)}
                onOpenChange={(isOpen) => setIsActionsDropdownOpen(isOpen)}
                popperProps={{ position: "right" }}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={handleActionsDropdownToggle}
                    isExpanded={isActionsDropdownOpen}
                  >
                    Actions
                  </MenuToggle>
                )}
                ouiaId="BasicDropdown"
                shouldFocusToggleOnSelect
              >
                <DropdownList>
                  <DropdownItem key="scan-another" onClick={scanAnotherFile}>
                    Scan another
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            </SplitItem>
          </Split>
        )}
      </PageSection>
      <PageSection>
        {uploadResponseData === null ? (
          <UploadFileForAnalysis
            uploads={uploads}
            handleUpload={handleUpload}
            handleRemoveUpload={handleRemoveUpload}
            handleCancelUpload={handleCancelUpload}
          />
        ) : isFetching ? (
          <EmptyState
            titleText="Generating SBOM report"
            headingLevel="h4"
            icon={InProgressIcon}
          >
            <EmptyStateBody>
              Analyzing your SBOM for security vulnerabilities, license issues
              and dependency details.
            </EmptyStateBody>
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="link" onClick={scanAnotherFile}>
                  Cancel scan
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          </EmptyState>
        ) : fetchError ? (
          <EmptyState
            status="danger"
            headingLevel="h4"
            titleText="Scan failed"
            icon={ExclamationCircleIcon}
            variant={EmptyStateVariant.sm}
          >
            <EmptyStateBody>
              The file could not be analyzed. The file might be corrupted or an
              unsupported format.
            </EmptyStateBody>
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="primary" onClick={scanAnotherFile}>
                  Try another file
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          </EmptyState>
        ) : (
          <Stack hasGutter>
            <StackItem>
              <VulnerabilityMetrics
                summary={summary}
                isFetching={isFetching}
                fetchError={fetchError}
              />
            </StackItem>
            <StackItem>
              <VulnerabilityTable
                vulnerabilities={vulnerabilities}
                isFetching={isFetching}
                fetchError={fetchError}
              />
            </StackItem>
          </Stack>
        )}
      </PageSection>
    </>
  );
};
