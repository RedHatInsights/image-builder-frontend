import React from 'react';

import { Label, Tooltip } from '@patternfly/react-core';
import { UploadIcon } from '@patternfly/react-icons';

const UploadRepositoryLabel = () => {
  return (
    <Tooltip content="Upload repository: Doesn't have an URL, snapshots are taken when content is uploaded to the custom repo.">
      <Label
        variant="outline"
        isCompact
        icon={<UploadIcon />}
        style={{ marginLeft: '8px' }}
      >
        Upload
      </Label>
    </Tooltip>
  );
};

export default UploadRepositoryLabel;
