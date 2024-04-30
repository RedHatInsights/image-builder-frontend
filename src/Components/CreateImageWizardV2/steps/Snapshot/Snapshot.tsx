import React from 'react';

import {
  Button,
  DatePicker,
  Flex,
  FormGroup,
  Grid,
  Radio,
  Text,
  Title,
} from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  selectSnapshotDate,
  selectUseLatest,
  changeUseLatest,
  changeSnapshotDate,
} from '../../../../store/wizardSlice';
import {
  dateToMMDDYYYY,
  parseMMDDYYYYtoDate,
} from '../../../../Utilities/time';

const dateValidators = [
  (date: Date) => {
    if (date.getTime() > Date.now()) {
      return 'Cannot set a date in the future';
    }
    return '';
  },
];

export default function Snapshot() {
  const dispatch = useAppDispatch();
  const snapshotDate = useAppSelector(selectSnapshotDate);
  const useLatest = useAppSelector(selectUseLatest);
  return (
    <>
      <FormGroup>
        <Radio
          id="use latest snapshot radio"
          ouiaId="use-latest-snapshot-radio"
          name="use-latest-snapshot"
          label="Use latest content"
          description="Use the newest repository state available when building this image."
          isChecked={useLatest}
          onChange={() => !useLatest && dispatch(changeUseLatest(true))}
        />
        <Radio
          id="use snapshot date radio"
          ouiaId="use-snapshot-date-radio"
          name="use-snapshot-date"
          label="Use a snapshot"
          description="Target a date and build images with repository information from this date."
          isChecked={!useLatest}
          onChange={() => useLatest && dispatch(changeUseLatest(false))}
        />
      </FormGroup>
      {useLatest ? (
        <>
          <Title headingLevel="h1" size="xl">
            Use latest content
          </Title>
          <Grid>
            <Text>
              Image Builder will automatically use the newest state of
              repositories when building this image.
            </Text>
          </Grid>
        </>
      ) : (
        <>
          <Title headingLevel="h1" size="xl">
            Use a snapshot
          </Title>
          <FormGroup label="Select snapshot date" isRequired>
            <Flex
              direction={{ default: 'row' }}
              alignContent={{ default: 'alignContentCenter' }}
            >
              <DatePicker
                id="pick snapshot date radio"
                name="pick-snapshot-date"
                value={snapshotDate}
                required
                requiredDateOptions={{ isRequired: true }}
                placeholder="MM/DD/YYYY"
                dateParse={parseMMDDYYYYtoDate}
                dateFormat={dateToMMDDYYYY}
                validators={dateValidators}
                onChange={(_, val) => dispatch(changeSnapshotDate(val))}
              />
              <Button
                variant="link"
                onClick={() => dispatch(changeSnapshotDate(''))}
              >
                Reset
              </Button>
            </Flex>
          </FormGroup>
          <Grid>
            <Text>
              Image Builder will reflect the state of repositories based on the
              selected date when building this image.
            </Text>
          </Grid>
        </>
      )}
    </>
  );
}
