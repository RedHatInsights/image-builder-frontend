import React, { useState } from 'react';

import {
  Button,
  Popover,
  Text,
  TextContent,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';
// eslint-disable-next-line rulesdir/disallow-fec-relative-imports
import {
  OpenSourceBadge,
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import { useNavigate } from 'react-router-dom';

import BetaLabel from './BetaLabel';

import {
  CREATE_RHEL_IMAGES_WITH_AUTOMATED_MANAGEMENT_URL,
  CREATING_IMAGES_WITH_IB_SERVICE_URL,
  OSBUILD_SERVICE_ARCHITECTURE_URL,
} from '../../constants';
import { useBackendPrefetch } from '../../store/backendApi';
import { useAppSelector } from '../../store/hooks';
import { selectDistribution } from '../../store/wizardSlice';
import { resolveRelPath } from '../../Utilities/path';
import './ImageBuilderHeader.scss';
import { useFlagWithEphemDefault } from '../../Utilities/useGetEnvironment';
import { ImportBlueprintModal } from '../Blueprints/ImportBlueprintModal';

type ImageBuilderHeaderPropTypes = {
  activeTab?: number;
  inWizard?: boolean;
};

const AboutImageBuilderPopover = () => {
  return (
    <Popover
      minWidth="35rem"
      headerContent={'About image builder'}
      bodyContent={
        <TextContent>
          <Text>
            Image builder is a tool for creating deployment-ready customized
            system images: installation disks, virtual machines, cloud
            vendor-specific images, and others. By using image builder, you can
            make these images faster than manual procedures because it
            eliminates the specific configurations required for each output
            type.
          </Text>
          <Text>
            <Button
              component="a"
              target="_blank"
              variant="link"
              icon={<ExternalLinkAltIcon />}
              iconPosition="right"
              isInline
              href={CREATING_IMAGES_WITH_IB_SERVICE_URL}
            >
              Image builder for RPM-DNF documentation
            </Button>
          </Text>
          <Text>
            <Button
              component="a"
              target="_blank"
              variant="link"
              icon={<ExternalLinkAltIcon />}
              iconPosition="right"
              isInline
              href={CREATE_RHEL_IMAGES_WITH_AUTOMATED_MANAGEMENT_URL}
            >
              Image builder for OSTree documentation
            </Button>
          </Text>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        aria-label="About image builder"
        className="pf-v5-u-pl-sm header-button"
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};

export const ImageBuilderHeader = ({
  activeTab,
  inWizard,
}: ImageBuilderHeaderPropTypes) => {
  const navigate = useNavigate();

  const distribution = useAppSelector(selectDistribution);
  const prefetchTargets = useBackendPrefetch('getArchitectures');

  const importExportFlag = useFlagWithEphemDefault(
    'image-builder.import.enabled'
  );
  const [showImportModal, setShowImportModal] = useState(false);
  const isOnBlueprintsTab = activeTab === 0;
  return (
    <>
      {importExportFlag && (
        <ImportBlueprintModal
          setShowImportModal={setShowImportModal}
          isOpen={showImportModal}
        />
      )}
      <PageHeader data-testid="image-builder-header">
        <Flex>
          <FlexItem>
            <PageHeaderTitle
              className="title"
              title={
                <>
                  Images <AboutImageBuilderPopover />
                  <OpenSourceBadge
                    repositoriesURL={OSBUILD_SERVICE_ARCHITECTURE_URL}
                  />
                </>
              }
            />
          </FlexItem>
          {!inWizard && (
            <>
              <FlexItem align={{ default: 'alignRight' }}>
                <Button
                  variant="primary"
                  data-testid="blueprints-create-button"
                  onClick={() => navigate(resolveRelPath('imagewizard'))}
                  isDisabled={!isOnBlueprintsTab}
                  onMouseEnter={() =>
                    prefetchTargets({
                      distribution: distribution,
                    })
                  }
                >
                  Create blueprint
                </Button>
              </FlexItem>
              <FlexItem>
                {importExportFlag && (
                  <Button
                    data-testid="import-blueprint-button"
                    ouiaId="import-blueprint-button"
                    variant="secondary"
                    icon={<BetaLabel />}
                    iconPosition="end"
                    onClick={() => setShowImportModal(true)}
                    isDisabled={!isOnBlueprintsTab}
                  >
                    Import
                  </Button>
                )}
              </FlexItem>
            </>
          )}
        </Flex>
      </PageHeader>
    </>
  );
};
