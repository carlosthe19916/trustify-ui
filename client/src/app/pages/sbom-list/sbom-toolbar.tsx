import React from "react";

import { AxiosError, AxiosResponse } from "axios";

import {
  Button,
  Checkbox,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Modal,
  ModalVariant,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import ShieldAltIcon from "@patternfly/react-icons/dist/esm/icons/shield-alt-icon";
import styles from "@patternfly/react-styles/css/components/Table/table";

import { FilterToolbar } from "@app/components/FilterToolbar";
import { SimplePagination } from "@app/components/SimplePagination";
import { UploadFilesDrawer } from "@app/components/UploadFilesDrawer";
import { useUploadSBOM } from "@app/queries/sboms";

import { SbomSearchContext } from "./sbom-context";
import {
  Table,
  Tbody,
  TbodyProps,
  Td,
  Thead,
  Tr,
  TrProps,
} from "@patternfly/react-table";

interface ISbomToolbar {}

export const SbomToolbar: React.FC<ISbomToolbar> = ({}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const bodyRef = React.useRef<HTMLTableSectionElement>();

  const [draggedItemId, setDraggedItemId] = React.useState<string | null>(null);
  const [draggingToItemIndex, setDraggingToItemIndex] = React.useState<
    number | null
  >(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [itemOrder, setItemOrder] = React.useState(["row1", "row2", "row3"]);
  const [tempItemOrder, setTempItemOrder] = React.useState<string[]>([]);

  const { tableControls } = React.useContext(SbomSearchContext);

  const {
    propHelpers: {
      toolbarProps,
      filterToolbarProps,
      paginationToolbarItemProps,
      paginationProps,
    },
  } = tableControls;

  const [showUploadComponent, setShowUploadComponent] = React.useState(false);
  const { uploads, handleUpload, handleRemoveUpload } = useUploadSBOM();

  const onDragStart: TrProps["onDragStart"] = (evt) => {
    evt.dataTransfer.effectAllowed = "move";
    evt.dataTransfer.setData("text/plain", evt.currentTarget.id);
    const draggedItemId = evt.currentTarget.id;

    evt.currentTarget.classList.add(styles.modifiers.ghostRow);
    evt.currentTarget.setAttribute("aria-pressed", "true");

    setDraggedItemId(draggedItemId);
    setIsDragging(true);
  };

  const moveItem = (arr: string[], i1: string, toIndex: number) => {
    const fromIndex = arr.indexOf(i1);
    if (fromIndex === toIndex) {
      return arr;
    }
    const temp = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, temp[0]);

    return arr;
  };

  const move = (itemOrder: string[]) => {
    const ulNode = bodyRef.current;
    if (!ulNode) return;

    const nodes = Array.from(ulNode.children);
    if (nodes.map((node) => node.id).every((id, i) => id === itemOrder[i])) {
      return;
    }
    while (ulNode.firstChild) {
      if (ulNode.lastChild) {
        ulNode.removeChild(ulNode.lastChild);
      }
    }

    itemOrder.forEach((id) => {
      const a = nodes.find((n) => n.id === id);
      if (a) {
        ulNode.appendChild(a);
      }
    });
  };

  const onDragCancel = () => {
    if (bodyRef.current?.children) {
      Array.from(bodyRef.current.children).forEach((el) => {
        el.classList.remove(styles.modifiers.ghostRow);
        el.setAttribute("aria-pressed", "false");
      });
      setDraggedItemId(null);
      setDraggingToItemIndex(null);
      setIsDragging(false);
    }
  };

  const onDragLeave: TbodyProps["onDragLeave"] = (evt) => {
    if (!isValidDrop(evt)) {
      move(itemOrder);
      setDraggingToItemIndex(null);
    }
  };

  const isValidDrop = (
    evt: React.DragEvent<HTMLTableSectionElement | HTMLTableRowElement>
  ) => {
    const ulRect = bodyRef.current?.getBoundingClientRect();
    if (!ulRect) return false;
    return (
      evt.clientX > ulRect.x &&
      evt.clientX < ulRect.x + ulRect.width &&
      evt.clientY > ulRect.y &&
      evt.clientY < ulRect.y + ulRect.height
    );
  };

  const onDrop: TrProps["onDrop"] = (evt) => {
    if (isValidDrop(evt)) {
      setItemOrder(tempItemOrder);
    } else {
      onDragCancel();
    }
  };

  const onDragOver: TbodyProps["onDragOver"] = (evt) => {
    evt.preventDefault();

    const curListItem = (evt.target as HTMLTableSectionElement).closest("tr");
    if (
      !curListItem ||
      !bodyRef.current?.contains(curListItem) ||
      curListItem.id === draggedItemId
    ) {
      return null;
    } else {
      const dragId = curListItem.id;
      const newDraggingToItemIndex = Array.from(
        bodyRef.current.children
      ).findIndex((item) => item.id === dragId);
      if (newDraggingToItemIndex !== draggingToItemIndex) {
        const tempItemOrder = moveItem(
          [...itemOrder],
          draggedItemId!,
          newDraggingToItemIndex
        );
        move(tempItemOrder);
        setDraggingToItemIndex(newDraggingToItemIndex);
        setTempItemOrder(tempItemOrder);
      }
    }
  };

  const onDragEnd: TrProps["onDragEnd"] = (evt) => {
    const target = evt.target as HTMLTableRowElement;
    target.classList.remove(styles.modifiers.ghostRow);
    target.setAttribute("aria-pressed", "false");
    setDraggedItemId(null);
    setDraggingToItemIndex(null);
    setIsDragging(false);
  };

  const rows = [
    {
      id: "row1",
      repository: "OSV",
    },
    {
      id: "row2",
      repository: "CVE",
    },
    {
      id: "row3",
      repository: "Red Hat CSAF",
    },
  ];

  const columns = ["Repositories"];

  return (
    <>
      <Toolbar {...toolbarProps}>
        <ToolbarContent>
          <FilterToolbar {...filterToolbarProps} />
          <ToolbarItem>
            <Button
              type="button"
              id="upload"
              aria-label="Upload"
              variant="secondary"
              onClick={() => setShowUploadComponent(true)}
            >
              Upload
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button
              variant="plain"
              icon={<ShieldAltIcon />}
              onClick={() => setIsOpen(!isOpen)}
            ></Button>
          </ToolbarItem>
          <ToolbarItem {...paginationToolbarItemProps}>
            <SimplePagination
              idPrefix="sbom-table"
              isTop
              paginationProps={paginationProps}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <UploadFilesDrawer
        isExpanded={showUploadComponent}
        uploads={uploads}
        handleUpload={handleUpload}
        handleRemoveUpload={handleRemoveUpload}
        extractSuccessMessage={(
          response: AxiosResponse<{ document_id: string }>
        ) => {
          return `${response.data.document_id} uploaded`;
        }}
        extractErrorMessage={(error: AxiosError) =>
          error.response?.data ? error.message : "Error while uploading file"
        }
        onCloseClick={() => setShowUploadComponent(false)}
      />

      <Modal
        variant={ModalVariant.small}
        title="Manage vendors"
        description="Select the vendors you want to display vulnerabilities from."
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        actions={[
          <Button
            key="confirm"
            variant="primary"
            onClick={() => setIsOpen(false)}
          >
            Save
          </Button>,
          <Button key="cancel" variant="link" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>,
        ]}
        ouiaId="BasicModal"
      >
        <DataList aria-label="Simple data list example">
          <DataListItem aria-labelledby="simple-item1">
            <DataListItemRow>
              <DataListItemCells
                dataListCells={[
                  <DataListCell key="primary content">
                    <Checkbox id="check-1" label="OSV" />
                  </DataListCell>,
                ]}
              />
            </DataListItemRow>
          </DataListItem>
          <DataListItem aria-labelledby="simple-item1">
            <DataListItemRow>
              <DataListItemCells
                dataListCells={[
                  <DataListCell key="primary content">
                    <Checkbox id="check-2" label="CVE" />
                  </DataListCell>,
                ]}
              />
            </DataListItemRow>
          </DataListItem>
          <DataListItem aria-labelledby="simple-item1">
            <DataListItemRow>
              <DataListItemCells
                dataListCells={[
                  <DataListCell key="primary content">
                    <Checkbox id="check-3" label="Red Hat CSAF" />
                  </DataListCell>,
                ]}
              />
            </DataListItemRow>
          </DataListItem>
        </DataList>

        {/* <Table
          aria-label="Draggable table"
          className={styles.modifiers.dragOver}
        >
          <Tbody
            ref={bodyRef as any}
            onDragOver={onDragOver}
            onDrop={onDragOver}
            onDragLeave={onDragLeave}
          >
            {rows.map((row, rowIndex) => {
              const rowCellsToBuild = Object.keys(row).filter(
                (rowCell) => rowCell !== "id"
              );
              return (
                <Tr
                  key={rowIndex}
                  id={row.id}
                  draggable
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                  onDragStart={onDragStart}
                >
                  <Td
                    draggableRow={{
                      id: `draggable-row-${row.id}`,
                    }}
                  />
                  {rowCellsToBuild.map((key, keyIndex) => (
                    <Td
                      key={`${rowIndex}_${keyIndex}`}
                      dataLabel={columns[keyIndex]}
                    >
                      {(row as any)[key]}
                    </Td>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
        </Table> */}
      </Modal>
    </>
  );
};
