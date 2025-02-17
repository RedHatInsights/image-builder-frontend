import React, { useRef, useState } from 'react';

import {
  Popover,
  TextContent,
  Text,
  Button,
  Alert,
  TextInput,
  Select,
  MenuToggleElement,
  MenuToggle,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { HelpIcon, MinusCircleIcon } from '@patternfly/react-icons';
import styles from '@patternfly/react-styles/css/components/Table/table';
import {
  Table,
  Th,
  Thead,
  Tbody,
  Tr,
  TrProps,
  TbodyProps,
  Td,
} from '@patternfly/react-table';

import { UNIT_GIB, UNIT_KIB, UNIT_MIB } from '../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  changePartitionMinSize,
  changePartitionMountpoint,
  changePartitionOrder,
  changePartitionUnit,
  removePartition,
  selectPartitions,
} from '../../../../store/wizardSlice';
import { useFilesystemValidation } from '../../utilities/useValidation';
import { HookValidatedInput } from '../../ValidatedInput';

export const FileSystemContext = React.createContext<boolean>(true);

export const MinimumSizePopover = () => {
  return (
    <Popover
      maxWidth="30rem"
      bodyContent={
        <TextContent>
          <Text>
            Image Builder may extend this size based on requirements, selected
            packages, and configurations.
          </Text>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        aria-label="File system configuration info"
        aria-describedby="file-system-configuration-info"
        className="pf-v5-u-pl-sm pf-v5-u-pt-0 pf-v5-u-pb-0"
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};

export type Partition = {
  id: string;
  mountpoint: string;
  min_size: string;
  unit: Units;
};

type RowPropTypes = {
  partition: Partition;
  onDrop?: (event: React.DragEvent<HTMLTableRowElement>) => void;
  onDragEnd?: (event: React.DragEvent<HTMLTableRowElement>) => void;
  onDragStart?: (event: React.DragEvent<HTMLTableRowElement>) => void;
};

const normalizeSuffix = (rawSuffix: string) => {
  const suffix = rawSuffix.replace(/^\/+/g, '');
  return suffix.length > 0 ? '/' + suffix : '';
};

const getPrefix = (mountpoint: string) => {
  return mountpoint.split('/')[1] ? '/' + mountpoint.split('/')[1] : '/';
};
const getSuffix = (mountpoint: string) => {
  const prefix = getPrefix(mountpoint);
  return normalizeSuffix(mountpoint.substring(prefix.length));
};

const Row = ({ partition, onDragEnd, onDragStart, onDrop }: RowPropTypes) => {
  const dispatch = useAppDispatch();
  const handleRemovePartition = (id: string) => {
    dispatch(removePartition(id));
  };
  const stepValidation = useFilesystemValidation();
  const isPristine = React.useContext(FileSystemContext);

  return (
    <Tr
      draggable
      id={partition.id}
      onDrop={onDrop}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <Td
        draggableRow={{
          id: `draggable-row-${partition.id}`,
        }}
      />
      <Td className="pf-m-width-20">
        <MountpointPrefix partition={partition} />
        {!isPristine && stepValidation.errors[`mountpoint-${partition.id}`] && (
          <Alert
            variant="danger"
            isInline
            isPlain
            title={stepValidation.errors[`mountpoint-${partition.id}`]}
          />
        )}
      </Td>
      {partition.mountpoint !== '/' &&
      !partition.mountpoint.startsWith('/boot') &&
      !partition.mountpoint.startsWith('/usr') ? (
        <Td width={20}>
          <MountpointSuffix partition={partition} />
        </Td>
      ) : (
        <Td width={20} />
      )}

      <Td width={20}>xfs</Td>
      <Td width={20}>
        <MinimumSize partition={partition} />
      </Td>
      <Td width={10}>
        <SizeUnit partition={partition} />
      </Td>
      <Td width={10}>
        <Button
          variant="link"
          icon={<MinusCircleIcon />}
          onClick={() => handleRemovePartition(partition.id)}
          ouiaId="remove-mount-point"
          isDisabled={partition.mountpoint === '/'}
        />
      </Td>
    </Tr>
  );
};

export const mountpointPrefixes = [
  '/app',
  '/boot',
  '/data',
  '/home',
  '/opt',
  '/srv',
  '/tmp',
  '/usr',
  '/var',
];

const units = ['GiB', 'MiB', 'KiB'];

type MountpointPrefixPropTypes = {
  partition: Partition;
};

const MountpointPrefix = ({ partition }: MountpointPrefixPropTypes) => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const prefix = getPrefix(partition.mountpoint);
  const suffix = getSuffix(partition.mountpoint);

  const onSelect = (event: React.MouseEvent, selection: string) => {
    setIsOpen(false);
    const mountpoint = selection + (suffix.length > 0 ? '/' + suffix : '');
    dispatch(
      changePartitionMountpoint({ id: partition.id, mountpoint: mountpoint })
    );
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      isDisabled={prefix === '/'}
      data-testid="prefix-select"
      isFullWidth
    >
      {prefix}
    </MenuToggle>
  );

  return (
    <Select
      ouiaId="mount-point"
      isOpen={isOpen}
      selected={prefix}
      onSelect={onSelect}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      toggle={toggle}
      shouldFocusToggleOnSelect
    >
      <SelectList>
        {mountpointPrefixes.map((prefix, index) => {
          return (
            <SelectOption key={index} value={prefix}>
              {prefix}
            </SelectOption>
          );
        })}
      </SelectList>
    </Select>
  );
};

type MountpointSuffixPropTypes = {
  partition: Partition;
};

const MountpointSuffix = ({ partition }: MountpointSuffixPropTypes) => {
  const dispatch = useAppDispatch();
  const prefix = getPrefix(partition.mountpoint);
  const suffix = getSuffix(partition.mountpoint);

  return (
    <TextInput
      value={suffix}
      type="text"
      onChange={(event: React.FormEvent, newValue) => {
        const mountpoint = prefix + normalizeSuffix(newValue);
        dispatch(
          changePartitionMountpoint({
            id: partition.id,
            mountpoint: mountpoint,
          })
        );
      }}
      aria-label="mountpoint suffix"
      ouiaId="mount-suffix"
    />
  );
};

type MinimumSizePropTypes = {
  partition: Partition;
};

export type Units = 'B' | 'KiB' | 'MiB' | 'GiB';

export const getConversionFactor = (units: Units) => {
  switch (units) {
    case 'B':
      return 1;
    case 'KiB':
      return UNIT_KIB;
    case 'MiB':
      return UNIT_MIB;
    case 'GiB':
      return UNIT_GIB;
  }
};

const MinimumSize = ({ partition }: MinimumSizePropTypes) => {
  const dispatch = useAppDispatch();
  const stepValidation = useFilesystemValidation();

  return (
    <HookValidatedInput
      ariaLabel="minimum partition size"
      value={partition.min_size}
      isDisabled={partition.unit === 'B'}
      warning={
        partition.unit === 'B'
          ? 'The Wizard only supports KiB, MiB, or GiB. Adjust or keep the current value.'
          : ''
      }
      type="text"
      ouiaId="size"
      stepValidation={stepValidation}
      fieldName={`min-size-${partition.id}`}
      onChange={(event, minSize) => {
        if (minSize === '' || /^\d+$/.test(minSize)) {
          dispatch(
            changePartitionMinSize({
              id: partition.id,
              min_size: minSize,
            })
          );
          dispatch(
            changePartitionUnit({ id: partition.id, unit: partition.unit })
          );
        }
      }}
    />
  );
};

type SizeUnitPropTypes = {
  partition: Partition;
};

const SizeUnit = ({ partition }: SizeUnitPropTypes) => {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const initialValue = useRef(partition).current;

  const onSelect = (event: React.MouseEvent, selection: Units) => {
    if (initialValue.unit === 'B' && selection === 'B') {
      dispatch(
        changePartitionMinSize({
          id: partition.id,
          min_size: initialValue.min_size,
        })
      );
    }
    dispatch(changePartitionUnit({ id: partition.id, unit: selection }));
    setIsOpen(false);
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      data-testid="unit-select"
    >
      {partition.unit}
    </MenuToggle>
  );

  return (
    <Select
      ouiaId="unit"
      isOpen={isOpen}
      selected={partition.unit}
      onSelect={onSelect}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      toggle={toggle}
      shouldFocusToggleOnSelect
    >
      <SelectList>
        {units.map((unit, index) => (
          <SelectOption key={index} value={unit}>
            {unit}
          </SelectOption>
        ))}
        <>
          {initialValue.unit === 'B' && (
            <SelectOption value={'B'}>B</SelectOption>
          )}
        </>
      </SelectList>
    </Select>
  );
};

const FileSystemTable = () => {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggingToItemIndex, setDraggingToItemIndex] = useState<number | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [tempItemOrder, setTempItemOrder] = useState<string[]>([]);

  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const partitions = useAppSelector(selectPartitions);
  const itemOrder = partitions.map((partition) => partition.id);
  const dispatch = useAppDispatch();
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

  const onDragStart: TrProps['onDragStart'] = (evt) => {
    evt.dataTransfer.effectAllowed = 'move';
    evt.dataTransfer.setData('text/plain', evt.currentTarget.id);
    const draggedItemId = evt.currentTarget.id;

    evt.currentTarget.classList.add(styles.modifiers.ghostRow);
    evt.currentTarget.setAttribute('aria-pressed', 'true');

    setDraggedItemId(draggedItemId);
    setIsDragging(true);
  };

  const onDragCancel = () => {
    const children = bodyRef.current?.children;
    if (children) {
      Array.from(children).forEach((el) => {
        el.classList.remove(styles.modifiers.ghostRow);
        el.setAttribute('aria-pressed', 'false');
      });
    }
    setDraggedItemId(null);
    setDraggingToItemIndex(null);
    setIsDragging(false);
  };

  const onDragLeave: TbodyProps['onDragLeave'] = (evt) => {
    if (!isValidDrop(evt)) {
      move(itemOrder);
      setDraggingToItemIndex(null);
    }
  };

  const onDrop: TrProps['onDrop'] = (evt) => {
    if (isValidDrop(evt)) {
      dispatch(changePartitionOrder(tempItemOrder));
    } else {
      onDragCancel();
    }
  };

  const onDragOver: TbodyProps['onDragOver'] = (evt) => {
    evt.preventDefault();

    const curListItem = (evt.target as HTMLTableSectionElement).closest('tr');
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
      if (newDraggingToItemIndex !== draggingToItemIndex && draggedItemId) {
        const tempItemOrder = moveItem(
          [...itemOrder],
          draggedItemId,
          newDraggingToItemIndex
        );
        move(tempItemOrder);
        setDraggingToItemIndex(newDraggingToItemIndex);
        setTempItemOrder(tempItemOrder);
      }
    }
  };

  const onDragEnd: TrProps['onDragEnd'] = (evt) => {
    const target = evt.target as HTMLTableRowElement;
    target.classList.remove(styles.modifiers.ghostRow);
    target.setAttribute('aria-pressed', 'false');
    setDraggedItemId(null);
    setDraggingToItemIndex(null);
    setIsDragging(false);
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
    if (!ulNode) {
      return;
    }
    const nodes = Array.from(ulNode.children);
    if (nodes.map((node) => node.id).every((id, i) => id === itemOrder[i])) {
      return;
    }
    while (ulNode.firstChild) {
      ulNode.removeChild(ulNode.lastChild as Node);
    }

    itemOrder.forEach((id) => {
      const node = nodes.find((n) => n.id === id);
      if (node) {
        ulNode.appendChild(node);
      }
    });
  };

  return (
    <Table
      className={isDragging ? styles.modifiers.dragOver : ''}
      ouiaId="partition_table_v2"
      aria-label="File system table"
      variant="compact"
      data-testid="fsc-table"
    >
      <Thead>
        <Tr>
          <Th aria-label="Drag mount point" />
          <Th>Mount point</Th>
          <Th aria-label="Suffix"></Th>
          <Th>Type</Th>
          <Th>
            Minimum size <MinimumSizePopover />
          </Th>
          <Th aria-label="Unit" />
          <Th aria-label="Remove mount point" />
        </Tr>
      </Thead>

      <Tbody
        onDragOver={onDragOver}
        onDrop={onDragOver}
        onDragLeave={onDragLeave}
        ref={bodyRef}
        data-testid="file-system-configuration-tbody"
      >
        {partitions &&
          partitions.map((partition) => (
            <Row
              onDrop={onDrop}
              onDragEnd={onDragEnd}
              onDragStart={onDragStart}
              key={partition.id}
              partition={partition}
            />
          ))}
      </Tbody>
    </Table>
  );
};

export default FileSystemTable;
