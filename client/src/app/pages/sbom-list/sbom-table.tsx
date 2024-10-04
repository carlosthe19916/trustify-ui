import React from "react";
import { NavLink } from "react-router-dom";

import { AxiosError } from "axios";

import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  LabelGroup,
  List,
  ListItem,
  Popover,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import {
  ActionsColumn,
  ExpandableRowContent,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";

import { SbomPackage, SbomSummary } from "@app/client";
import { EditLabelsModal } from "@app/components/EditLabelsModal";
import { FilterType } from "@app/components/FilterToolbar";
import { LabelsAsList } from "@app/components/LabelsAsList";
import { NotificationsContext } from "@app/components/NotificationsContext";
import { PackagesCount } from "@app/components/PackagesCount";
import { SimplePagination } from "@app/components/SimplePagination";
import {
  ConditionalTableBody,
  TableHeaderContentWithControls,
  TableRowContentWithControls,
} from "@app/components/TableControls";
import { useLocalTableControls } from "@app/hooks/table-controls";
import { useDownload } from "@app/hooks/useDownload";
import {
  useDeleteSbomMutation,
  useUpdateSbomLabelsMutation,
} from "@app/queries/sboms";
import { formatDate } from "@app/utils/utils";

import { SbomSearchContext } from "./sbom-context";
import { SeverityShieldAndText } from "@app/components/SeverityShieldAndText";
import { VulnerabilityGallery } from "@app/components/VulnerabilityGallery";

export const SbomTable: React.FC = ({}) => {
  const { isFetching, fetchError, totalItemCount, tableControls } =
    React.useContext(SbomSearchContext);

  const { pushNotification } = React.useContext(NotificationsContext);

  // Actions that each row can trigger
  type RowAction = "editLabels";
  const [selectedRowAction, setSelectedRowAction] =
    React.useState<RowAction | null>(null);
  const [selectedRow, setSelectedRow] = React.useState<SbomSummary | null>(
    null
  );

  const prepareActionOnRow = (action: RowAction, row: SbomSummary) => {
    setSelectedRowAction(action);
    setSelectedRow(row);
  };

  const onUpdateLabelsError = (_error: AxiosError) => {
    pushNotification({
      title: "Error while updating labels",
      variant: "danger",
    });
  };

  const { mutate: updateSbomLabels } = useUpdateSbomLabelsMutation(
    () => {},
    onUpdateLabelsError
  );

  const onDeleteSbomSuccess = (sbom: SbomSummary) => {
    pushNotification({
      title: `The SBOM ${sbom.name} was deleted`,
      variant: "danger",
    });
  };

  const onDeleteAdvisoryError = (_error: AxiosError) => {
    pushNotification({
      title: "Error occurred while deleting the SBOM",
      variant: "danger",
    });
  };

  const deleteSBOMByIdMutation = useDeleteSbomMutation(
    onDeleteSbomSuccess,
    onDeleteAdvisoryError
  );

  const execSaveLabels = (
    row: SbomSummary,
    labels: { [key: string]: string }
  ) => {
    updateSbomLabels({ ...row, labels });
  };

  const {
    numRenderedColumns,
    currentPageItems,
    propHelpers: {
      paginationProps,
      tableProps,
      getThProps,
      getTrProps,
      getTdProps,
    },
    expansionDerivedState: { isCellExpanded },
  } = tableControls;

  const { downloadSBOM } = useDownload();

  return (
    <>
      <Table {...tableProps} aria-label="sbom-table">
        <Thead>
          <Tr>
            <TableHeaderContentWithControls {...tableControls}>
              <Th {...getThProps({ columnKey: "name" })} />
              <Th {...getThProps({ columnKey: "version" })} />
              <Th {...getThProps({ columnKey: "supplier" })} />
              <Th {...getThProps({ columnKey: "published" })} />
              <Th {...getThProps({ columnKey: "packages" })} />
              <Th {...getThProps({ columnKey: "vulnerabilities" })} />
            </TableHeaderContentWithControls>
          </Tr>
        </Thead>
        <ConditionalTableBody
          isLoading={isFetching}
          isError={!!fetchError}
          isNoData={totalItemCount === 0}
          numRenderedColumns={numRenderedColumns}
        >
          {currentPageItems.map((item, rowIndex) => {
            return (
              <Tbody key={item.id} isExpanded={isCellExpanded(item)}>
                <Tr {...getTrProps({ item })}>
                  <TableRowContentWithControls
                    {...tableControls}
                    item={item}
                    rowIndex={rowIndex}
                  >
                    <Td
                      width={30}
                      {...getTdProps({
                        columnKey: "name",
                        isCompoundExpandToggle: true,
                        item: item,
                        rowIndex,
                      })}
                    >
                      <NavLink to={`/sboms/${item.id}`}>{item.name}</NavLink>
                    </Td>
                    <Td
                      width={10}
                      modifier="truncate"
                      {...getTdProps({ columnKey: "version" })}
                    ></Td>
                    <Td
                      width={20}
                      modifier="truncate"
                      {...getTdProps({ columnKey: "supplier" })}
                    ></Td>

                    <Td width={10} {...getTdProps({ columnKey: "published" })}>
                      {formatDate(item.published)}
                    </Td>
                    <Td width={10} {...getTdProps({ columnKey: "packages" })}>
                      <PackagesCount sbomId={item.id} />
                    </Td>
                    <Td
                      width={20}
                      {...getTdProps({ columnKey: "vulnerabilities" })}
                    >
                      <Stack>
                        <StackItem>
                          <LabelGroup
                            categoryName="OSV"
                            isCompact
                            defaultIsOpen
                          >
                            <Label color="red" isCompact>
                              1
                            </Label>
                            <Label color="orange" isCompact>
                              10
                            </Label>
                            <Label color="gold" isCompact>
                              20
                            </Label>
                            <Label color="blue" isCompact>
                              20
                            </Label>
                            <Label color="grey" isCompact>
                              20
                            </Label>
                          </LabelGroup>
                          <LabelGroup
                            categoryName="CVE"
                            isCompact
                            defaultIsOpen
                          >
                            <Label color="red" isCompact>
                              1
                            </Label>
                            <Label color="orange" isCompact>
                              10
                            </Label>
                            <Label color="gold" isCompact>
                              20
                            </Label>
                            <Label color="blue" isCompact>
                              20
                            </Label>
                            <Label color="grey" isCompact>
                              20
                            </Label>
                          </LabelGroup>
                          <LabelGroup
                            categoryName="Red Hat CSAF"
                            isCompact
                            defaultIsOpen
                          >
                            <Label color="red" isCompact>
                              1
                            </Label>
                            <Label color="orange" isCompact>
                              10
                            </Label>
                            <Label color="gold" isCompact>
                              20
                            </Label>
                            <Label color="blue" isCompact>
                              20
                            </Label>
                            <Label color="grey" isCompact>
                              20
                            </Label>
                          </LabelGroup>
                        </StackItem>
                      </Stack>

                      {/* <Stack>
                        <StackItem>
                          <Popover
                            triggerAction="hover"
                            headerContent={<div>OSV</div>}
                            bodyContent={
                              <div>
                                <Table
                                  aria-label="Simple table"
                                  variant="compact"
                                >
                                  <Tbody>
                                    <Tr>
                                      <Td>11</Td>
                                      <Td>
                                        <SeverityShieldAndText value="critical" />
                                      </Td>
                                    </Tr>
                                    <Tr>
                                      <Td>12</Td>
                                      <Td>
                                        <SeverityShieldAndText value="high" />
                                      </Td>
                                    </Tr>
                                    <Tr>
                                      <Td>13</Td>
                                      <Td>
                                        <SeverityShieldAndText value="medium" />
                                      </Td>
                                    </Tr>
                                    <Tr>
                                      <Td>14</Td>
                                      <Td>
                                        <SeverityShieldAndText value="low" />
                                      </Td>
                                    </Tr>
                                    <Tr>
                                      <Td>15</Td>
                                      <Td>
                                        <SeverityShieldAndText value="none" />
                                      </Td>
                                    </Tr>
                                  </Tbody>
                                </Table>
                              </div>
                            }
                          >
                            <Button variant="link" size="sm">
                              OSV (11)
                            </Button>
                          </Popover>
                          <Popover
                            triggerAction="hover"
                            headerContent={<div>CVE</div>}
                            bodyContent={
                              <div>
                                <Table
                                  aria-label="Simple table"
                                  variant="compact"
                                >
                                  <Tbody>
                                    <Tr>
                                      <Td>11</Td>
                                      <Td>
                                        <SeverityShieldAndText value="critical" />
                                      </Td>
                                    </Tr>
                                    <Tr>
                                      <Td>12</Td>
                                      <Td>
                                        <SeverityShieldAndText value="high" />
                                      </Td>
                                    </Tr>
                                    <Tr>
                                      <Td>13</Td>
                                      <Td>
                                        <SeverityShieldAndText value="medium" />
                                      </Td>
                                    </Tr>
                                    <Tr>
                                      <Td>14</Td>
                                      <Td>
                                        <SeverityShieldAndText value="low" />
                                      </Td>
                                    </Tr>
                                    <Tr>
                                      <Td>15</Td>
                                      <Td>
                                        <SeverityShieldAndText value="none" />
                                      </Td>
                                    </Tr>
                                  </Tbody>
                                </Table>
                              </div>
                            }
                          >
                            <Button variant="link" size="sm">
                              CVE (12)
                            </Button>
                          </Popover>
                          <Popover
                            triggerAction="hover"
                            headerContent={<div>Red Hat CSAF</div>}
                            bodyContent={
                              <div>
                                <Table
                                  aria-label="Simple table"
                                  variant="compact"
                                >
                                  <Tbody>
                                    <Tr>
                                      <Td>11</Td>
                                      <Td>
                                        <SeverityShieldAndText value="critical" />
                                      </Td>
                                    </Tr>
                                    <Tr>
                                      <Td>12</Td>
                                      <Td>
                                        <SeverityShieldAndText value="high" />
                                      </Td>
                                    </Tr>
                                    <Tr>
                                      <Td>13</Td>
                                      <Td>
                                        <SeverityShieldAndText value="medium" />
                                      </Td>
                                    </Tr>
                                    <Tr>
                                      <Td>14</Td>
                                      <Td>
                                        <SeverityShieldAndText value="low" />
                                      </Td>
                                    </Tr>
                                    <Tr>
                                      <Td>15</Td>
                                      <Td>
                                        <SeverityShieldAndText value="none" />
                                      </Td>
                                    </Tr>
                                  </Tbody>
                                </Table>
                              </div>
                            }
                          >
                            <Button variant="link" size="sm">
                              Red Hat CSAF (13)
                            </Button>
                          </Popover>
                        </StackItem>
                      </Stack> */}

                      {/* <VulnerabilityGallery severities={{critical: 1, high: 2, medium: 3, low: 4, none: 5}}/> */}

                    </Td>
                    <Td isActionCell>
                      <ActionsColumn
                        items={[
                          {
                            title: "Edit labels",
                            onClick: () => {
                              prepareActionOnRow("editLabels", item);
                            },
                          },
                          {
                            title: "Download",
                            onClick: () => {
                              downloadSBOM(item.id, `${item.name}.json`);
                            },
                          },
                          {
                            title: "Delete",
                            onClick: () =>
                              deleteSBOMByIdMutation.mutate(item.id),
                          },
                        ]}
                      />
                    </Td>
                  </TableRowContentWithControls>
                </Tr>
              </Tbody>
            );
          })}
        </ConditionalTableBody>
      </Table>
      <SimplePagination
        idPrefix="sbom-table"
        isTop={false}
        isCompact
        paginationProps={paginationProps}
      />

      {selectedRowAction === "editLabels" && selectedRow && (
        <EditLabelsModal
          resourceName={selectedRow.name}
          value={selectedRow.labels ?? {}}
          onSave={(labels) => {
            execSaveLabels(selectedRow, labels);

            setSelectedRow(null);
            setSelectedRowAction(null);
          }}
          onClose={() => setSelectedRowAction(null)}
        />
      )}
    </>
  );
};
