import React, { useEffect, useMemo, useState } from 'react';

import {
  Button,
  Wizard,
  WizardFooterWrapper,
  WizardNavItem,
  WizardStep,
  useWizardContext,
  PageSection,
} from '@patternfly/react-core';
import { WizardStepType } from '@patternfly/react-core/dist/esm/components/Wizard';
import { useNavigate, useSearchParams } from 'react-router-dom';

import DetailsStep from './steps/Details';
import FileSystemStep from './steps/FileSystem';
import { FileSystemContext } from './steps/FileSystem/FileSystemTable';
import FirewallStep from './steps/Firewall';
import FirstBootStep from './steps/FirstBoot';
import HostnameStep from './steps/Hostname';
import ImageOutputStep from './steps/ImageOutput';
import KernelStep from './steps/Kernel';
import LocaleStep from './steps/Locale';
import OscapStep from './steps/Oscap';
import PackagesStep from './steps/Packages';
import RegistrationStep from './steps/Registration';
import RepositoriesStep from './steps/Repositories';
import ReviewStep from './steps/Review';
import ReviewWizardFooter from './steps/Review/Footer/Footer';
import ServicesStep from './steps/Services';
import SnapshotStep from './steps/Snapshot';
import Aws from './steps/TargetEnvironment/Aws';
import Azure from './steps/TargetEnvironment/Azure';
import Gcp from './steps/TargetEnvironment/Gcp';
import TimezoneStep from './steps/Timezone';
import UsersStep from './steps/Users';
import { getHostArch, getHostDistro } from './utilities/getHostInfo';
import {
  useFilesystemValidation,
  useSnapshotValidation,
  useFirstBootValidation,
  useDetailsValidation,
  useRegistrationValidation,
  useHostnameValidation,
  useKernelValidation,
  useUsersValidation,
  useTimezoneValidation,
  useFirewallValidation,
  useServicesValidation,
} from './utilities/useValidation';
import {
  isAwsAccountIdValid,
  isAzureTenantGUIDValid,
  isAzureSubscriptionIdValid,
  isAzureResourceGroupValid,
  isGcpEmailValid,
} from './validators';

import { RHEL_8, RHEL_10_BETA, AARCH64 } from '../../constants';
import { useListFeaturesQuery } from '../../store/contentSourcesApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import './CreateImageWizard.scss';
import {
  changeDistribution,
  changeArchitecture,
  initializeWizard,
  selectAwsAccountId,
  selectAwsShareMethod,
  selectAwsSourceId,
  selectAzureResourceGroup,
  selectAzureShareMethod,
  selectAzureSource,
  selectAzureSubscriptionId,
  selectAzureTenantId,
  selectDistribution,
  selectGcpEmail,
  selectGcpShareMethod,
  selectImageTypes,
  addImageType,
} from '../../store/wizardSlice';
import { resolveRelPath } from '../../Utilities/path';
import { useFlag } from '../../Utilities/useGetEnvironment';
import { ImageBuilderHeader } from '../sharedComponents/ImageBuilderHeader';

type CustomWizardFooterPropType = {
  disableBack?: boolean;
  disableNext: boolean;
  beforeNext?: () => boolean;
  optional?: boolean;
};

export const CustomWizardFooter = ({
  disableBack: disableBack,
  disableNext: disableNext,
  beforeNext,
  optional: optional,
}: CustomWizardFooterPropType) => {
  const { goToNextStep, goToPrevStep, goToStepById, close } =
    useWizardContext();
  return (
    <WizardFooterWrapper>
      <Button
        ouiaId="wizard-next-btn"
        variant="primary"
        onClick={() => {
          if (!beforeNext || beforeNext()) goToNextStep();
        }}
        isDisabled={disableNext}
      >
        Next
      </Button>
      <Button
        ouiaId="wizard-back-btn"
        variant="secondary"
        onClick={goToPrevStep}
        isDisabled={disableBack || false}
      >
        Back
      </Button>
      {optional && (
        <Button
          ouiaId="wizard-review-and-finish-btn"
          variant="tertiary"
          onClick={() => {
            if (!beforeNext || beforeNext()) goToStepById('step-review');
          }}
          isDisabled={disableNext}
        >
          Review and finish
        </Button>
      )}
      <Button ouiaId="wizard-cancel-btn" variant="link" onClick={close}>
        Cancel
      </Button>
    </WizardFooterWrapper>
  );
};

type CreateImageWizardProps = {
  isEdit?: boolean;
};

const CreateImageWizard = ({ isEdit }: CreateImageWizardProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const isUsersEnabled = useFlag('image-builder.users.enabled');
  const isTimezoneEnabled = useFlag('image-builder.timezone.enabled');
  const isLocaleEnabled = useFlag('image-builder.locale.enabled');
  const isHostnameEnabled = useFlag('image-builder.hostname.enabled');
  const isKernelEnabled = useFlag('image-builder.kernel.enabled');
  const isFirewallEnabled = useFlag('image-builder.firewall.enabled');
  const isServicesStepEnabled = useFlag('image-builder.services.enabled');

  // Remove this and all fallthrough logic when snapshotting is enabled in Prod-stable
  // =========================TO REMOVE=======================
  const { data, isSuccess, isFetching, isError } =
    useListFeaturesQuery(undefined);

  const snapshotsFlag = useFlag('image-builder.snapshots.enabled');

  const snapshottingEnabled = useMemo(() => {
    if (!snapshotsFlag) return false;
    // The below checks if other environments permit the snapshot step
    return !(
      !isError &&
      !isFetching &&
      isSuccess &&
      data?.snapshots?.accessible === false &&
      data?.snapshots?.enabled === false
    );
  }, [data, isSuccess, isFetching, isError, snapshotsFlag]);

  // =========================TO REMOVE=======================

  // Feature flags
  const isFirstBootEnabled = useFlag('image-builder.firstboot.enabled');
  const complianceEnabled = useFlag('image-builder.compliance.enabled');

  // IMPORTANT: Ensure the wizard starts with a fresh initial state
  useEffect(() => {
    dispatch(initializeWizard());
    if (searchParams.get('release') === 'rhel8') {
      dispatch(changeDistribution(RHEL_8));
    }
    if (searchParams.get('release') === 'rhel10beta') {
      dispatch(changeDistribution(RHEL_10_BETA));
    }
    if (searchParams.get('arch') === AARCH64) {
      dispatch(changeArchitecture(AARCH64));
    }
    if (searchParams.get('target') === 'iso') {
      dispatch(addImageType('image-installer'));
    }
    if (searchParams.get('target') === 'qcow2') {
      dispatch(addImageType('guest-image'));
    }

    const initializeHostDistro = async () => {
      const distro = await getHostDistro();
      dispatch(changeDistribution(distro));
    };

    const initializeHostArch = async () => {
      const arch = await getHostArch();
      dispatch(changeArchitecture(arch));
    };

    if (process.env.IS_ON_PREMISE && !isEdit) {
      if (!searchParams.get('release')) {
        initializeHostDistro();
      }
      initializeHostArch();
    }
    // This useEffect hook should run *only* on mount and therefore has an empty
    // dependency array. eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*           *
   * Selectors *
   *           */

  const distribution = useAppSelector(selectDistribution);

  // Image Output
  const targetEnvironments = useAppSelector(selectImageTypes);
  // AWS
  const awsShareMethod = useAppSelector(selectAwsShareMethod);
  const awsAccountId = useAppSelector(selectAwsAccountId);
  const awsSourceId = useAppSelector(selectAwsSourceId);
  // GCP
  const gcpShareMethod = useAppSelector(selectGcpShareMethod);
  const gcpEmail = useAppSelector(selectGcpEmail);
  // AZURE
  const azureShareMethod = useAppSelector(selectAzureShareMethod);
  const azureTenantId = useAppSelector(selectAzureTenantId);
  const azureSubscriptionId = useAppSelector(selectAzureSubscriptionId);
  const azureResourceGroup = useAppSelector(selectAzureResourceGroup);
  const azureSource = useAppSelector(selectAzureSource);
  // Registration
  const registrationValidation = useRegistrationValidation();
  // Snapshots
  const snapshotValidation = useSnapshotValidation();
  // Filesystem
  const [filesystemPristine, setFilesystemPristine] = useState(true);
  const fileSystemValidation = useFilesystemValidation();
  // Timezone
  const timezoneValidation = useTimezoneValidation();
  // Hostname
  const hostnameValidation = useHostnameValidation();
  // Kernel
  const kernelValidation = useKernelValidation();
  // Firewall
  const firewallValidation = useFirewallValidation();
  // Services
  const servicesValidation = useServicesValidation();
  // Firstboot
  const firstBootValidation = useFirstBootValidation();
  // Details
  const detailsValidation = useDetailsValidation();
  // Users
  const usersValidation = useUsersValidation();

  let startIndex = 1; // default index
  if (isEdit) {
    startIndex = 22;
  }

  // Duplicating some of the logic from the Wizard component to allow for custom nav items status
  // for original code see https://github.com/patternfly/patternfly-react/blob/184c55f8d10e1d94ffd72e09212db56c15387c5e/packages/react-core/src/components/Wizard/WizardNavInternal.tsx#L128
  const customStatusNavItem = (
    step: WizardStepType,
    activeStep: WizardStepType,
    steps: WizardStepType[],
    goToStepByIndex: (index: number) => void
  ) => {
    const isVisitRequired = true;
    const hasVisitedNextStep = steps.some(
      (s) => s.index > step.index && s.isVisited
    );

    // Only this code is different from the original
    const status = (step.id !== activeStep.id && step.status) || 'default';

    return (
      <WizardNavItem
        key={step.id}
        id={step.id}
        content={step.name}
        isCurrent={activeStep.id === step.id}
        isDisabled={
          step.isDisabled ||
          (isVisitRequired && !step.isVisited && !hasVisitedNextStep)
        }
        isVisited={step.isVisited || false}
        stepIndex={step.index}
        onClick={() => goToStepByIndex(step.index)}
        status={status}
      />
    );
  };

  return (
    <>
      <ImageBuilderHeader inWizard />
      <PageSection isWidthLimited isCenterAligned>
        <Wizard
          startIndex={startIndex}
          onClose={() => navigate(resolveRelPath(''))}
          isVisitRequired
        >
          <WizardStep
            name="Image output"
            id="step-image-output"
            footer={
              <CustomWizardFooter
                disableNext={targetEnvironments.length === 0}
                disableBack={true}
              />
            }
          >
            <ImageOutputStep />
          </WizardStep>
          <WizardStep
            name="Target Environment"
            id="step-target-environment"
            isHidden={
              !targetEnvironments.find(
                (target) =>
                  target === 'aws' || target === 'gcp' || target === 'azure'
              )
            }
            steps={[
              <WizardStep
                name="Amazon Web Services"
                id="wizard-target-aws"
                key="wizard-target-aws"
                footer={
                  <CustomWizardFooter
                    disableNext={
                      awsShareMethod === 'manual'
                        ? !isAwsAccountIdValid(awsAccountId)
                        : awsSourceId === undefined
                    }
                  />
                }
                isHidden={!targetEnvironments.includes('aws')}
              >
                <Aws />
              </WizardStep>,
              <WizardStep
                name="Google Cloud Platform"
                id="wizard-target-gcp"
                key="wizard-target-gcp"
                footer={
                  <CustomWizardFooter
                    disableNext={
                      gcpShareMethod === 'withGoogle' &&
                      !isGcpEmailValid(gcpEmail)
                    }
                  />
                }
                isHidden={!targetEnvironments.includes('gcp')}
              >
                <Gcp />
              </WizardStep>,
              <WizardStep
                name="Azure"
                id="wizard-target-azure"
                key="wizard-target-azure"
                footer={
                  <CustomWizardFooter
                    disableNext={
                      azureShareMethod === 'manual'
                        ? !isAzureTenantGUIDValid(azureTenantId) ||
                          !isAzureSubscriptionIdValid(azureSubscriptionId) ||
                          !isAzureResourceGroupValid(azureResourceGroup)
                        : azureShareMethod === 'sources'
                        ? !isAzureTenantGUIDValid(azureTenantId) ||
                          !isAzureSubscriptionIdValid(azureSubscriptionId) ||
                          !isAzureResourceGroupValid(azureResourceGroup)
                        : azureSource === undefined
                    }
                  />
                }
                isHidden={!targetEnvironments.includes('azure')}
              >
                <Azure />
              </WizardStep>,
            ]}
          />
          <WizardStep
            name="Optional steps"
            id="step-optional-steps"
            steps={[
              <WizardStep
                name="Register"
                id="step-register"
                key="step-register"
                isHidden={!!process.env.IS_ON_PREMISE}
                navItem={customStatusNavItem}
                status={
                  registrationValidation.disabledNext ? 'error' : 'default'
                }
                footer={
                  <CustomWizardFooter
                    disableNext={registrationValidation.disabledNext}
                    optional={true}
                  />
                }
              >
                <RegistrationStep />
              </WizardStep>,
              <WizardStep
                name={complianceEnabled ? 'Compliance' : 'OpenSCAP'}
                id="step-oscap"
                key="step-oscap"
                isHidden={
                  distribution === RHEL_10_BETA || !!process.env.IS_ON_PREMISE
                }
                footer={
                  <CustomWizardFooter disableNext={false} optional={true} />
                }
              >
                <OscapStep />
              </WizardStep>,
              <WizardStep
                name="File system configuration"
                id="step-file-system"
                key="step-file-system"
                footer={
                  <CustomWizardFooter
                    beforeNext={() => {
                      if (fileSystemValidation.disabledNext) {
                        setFilesystemPristine(false);
                        return false;
                      }
                      return true;
                    }}
                    disableNext={
                      !filesystemPristine && fileSystemValidation.disabledNext
                    }
                    optional={true}
                  />
                }
              >
                <FileSystemContext.Provider value={filesystemPristine}>
                  <FileSystemStep />
                </FileSystemContext.Provider>
              </WizardStep>,
              <WizardStep
                name="Repository snapshot"
                id="wizard-repository-snapshot"
                key="wizard-repository-snapshot"
                navItem={customStatusNavItem}
                status={snapshotValidation.disabledNext ? 'error' : 'default'}
                isHidden={!snapshottingEnabled || distribution === RHEL_10_BETA}
                footer={
                  <CustomWizardFooter
                    disableNext={snapshotValidation.disabledNext}
                    optional={true}
                  />
                }
              >
                <SnapshotStep />
              </WizardStep>,
              <WizardStep
                name="Custom repositories"
                id="wizard-custom-repositories"
                key="wizard-custom-repositories"
                isHidden={
                  distribution === RHEL_10_BETA || !!process.env.IS_ON_PREMISE
                }
                isDisabled={snapshotValidation.disabledNext}
                footer={
                  <CustomWizardFooter disableNext={false} optional={true} />
                }
              >
                <RepositoriesStep />
              </WizardStep>,
              <WizardStep
                name="Additional packages"
                id="wizard-additional-packages"
                key="wizard-additional-packages"
                isDisabled={snapshotValidation.disabledNext}
                footer={
                  <CustomWizardFooter disableNext={false} optional={true} />
                }
              >
                <PackagesStep />
              </WizardStep>,
              <WizardStep
                name="Users"
                id="wizard-users"
                key="wizard-users"
                isHidden={!isUsersEnabled}
                footer={
                  <CustomWizardFooter
                    disableNext={usersValidation.disabledNext}
                    optional={true}
                  />
                }
              >
                <UsersStep />
              </WizardStep>,
              <WizardStep
                name="Timezone"
                id="wizard-timezone"
                key="wizard-timezone"
                navItem={customStatusNavItem}
                isHidden={!isTimezoneEnabled}
                status={timezoneValidation.disabledNext ? 'error' : 'default'}
                footer={
                  <CustomWizardFooter
                    disableNext={timezoneValidation.disabledNext}
                    optional={true}
                  />
                }
              >
                <TimezoneStep />
              </WizardStep>,
              <WizardStep
                name="Locale"
                id="wizard-locale"
                key="wizard-locale"
                navItem={customStatusNavItem}
                isHidden={!isLocaleEnabled}
                footer={
                  <CustomWizardFooter disableNext={false} optional={true} />
                }
              >
                <LocaleStep />
              </WizardStep>,
              <WizardStep
                name="Hostname"
                id="wizard-hostname"
                key="wizard-hostname"
                navItem={customStatusNavItem}
                isHidden={!isHostnameEnabled}
                status={hostnameValidation.disabledNext ? 'error' : 'default'}
                footer={
                  <CustomWizardFooter
                    disableNext={hostnameValidation.disabledNext}
                    optional={true}
                  />
                }
              >
                <HostnameStep />
              </WizardStep>,
              <WizardStep
                name="Kernel"
                id="wizard-kernel"
                key="wizard-kernel"
                navItem={customStatusNavItem}
                isHidden={!isKernelEnabled}
                status={kernelValidation.disabledNext ? 'error' : 'default'}
                footer={
                  <CustomWizardFooter
                    disableNext={kernelValidation.disabledNext}
                    optional={true}
                  />
                }
              >
                <KernelStep />
              </WizardStep>,
              <WizardStep
                name="Firewall"
                id="wizard-firewall"
                key="wizard-firewall"
                navItem={customStatusNavItem}
                isHidden={!isFirewallEnabled}
                status={firewallValidation.disabledNext ? 'error' : 'default'}
                footer={
                  <CustomWizardFooter
                    disableNext={firewallValidation.disabledNext}
                    optional={true}
                  />
                }
              >
                <FirewallStep />
              </WizardStep>,
              <WizardStep
                name="Systemd services"
                id="wizard-services"
                key="wizard-services"
                navItem={customStatusNavItem}
                isHidden={!isServicesStepEnabled}
                status={servicesValidation.disabledNext ? 'error' : 'default'}
                footer={
                  <CustomWizardFooter
                    disableNext={servicesValidation.disabledNext}
                    optional={true}
                  />
                }
              >
                <ServicesStep />
              </WizardStep>,
              <WizardStep
                name="First boot script configuration"
                id="wizard-first-boot"
                key="wizard-first-boot"
                navItem={customStatusNavItem}
                status={firstBootValidation.disabledNext ? 'error' : 'default'}
                isHidden={!isFirstBootEnabled}
                footer={
                  <CustomWizardFooter
                    disableNext={firstBootValidation.disabledNext}
                    optional={true}
                  />
                }
              >
                <FirstBootStep />
              </WizardStep>,
            ]}
          />
          <WizardStep
            name="Details"
            id="step-details"
            navItem={customStatusNavItem}
            status={detailsValidation.disabledNext ? 'error' : 'default'}
            footer={
              <CustomWizardFooter
                disableNext={detailsValidation.disabledNext}
              />
            }
          >
            <DetailsStep />
          </WizardStep>
          <WizardStep
            name="Review"
            id="step-review"
            footer={<ReviewWizardFooter />}
          >
            {/* Intentional prop drilling for simplicity - To be removed */}
            <ReviewStep snapshottingEnabled={snapshottingEnabled} />
          </WizardStep>
        </Wizard>
      </PageSection>
    </>
  );
};

export default CreateImageWizard;
