import React, { useState } from 'react';

import {
  Button,
  ExpandableSection,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
  TextVariants,
  useWizardContext,
} from '@patternfly/react-core';
import { ArrowRightIcon } from '@patternfly/react-icons';

import {
  ContentList,
  FSCList,
  FirstBootList,
  DetailsList,
  ImageOutputList,
  OscapList,
  RegisterLaterList,
  RegisterNowList,
  TargetEnvAWSList,
  TargetEnvAzureList,
  TargetEnvGCPList,
  TargetEnvOciList,
  TargetEnvOtherList,
  UsersList,
  TimezoneList,
  LocaleList,
  HostnameList,
  KernelList,
  FirewallList,
  ServicesList,
} from './ReviewStepTextLists';

import isRhel from '../../../../../src/Utilities/isRhel';
import { targetOptions } from '../../../../constants';
import { useAppSelector } from '../../../../store/hooks';
import {
  selectBlueprintDescription,
  selectBlueprintName,
  selectComplianceType,
  selectCompliancePolicyID,
  selectComplianceProfileID,
  selectDistribution,
  selectImageTypes,
  selectRegistrationType,
  selectHostname,
  selectLanguages,
  selectKeyboard,
  selectTimezone,
  selectNtpServers,
  selectFirewall,
  selectServices,
  selectUsers,
  selectKernel,
} from '../../../../store/wizardSlice';
import { useFlag } from '../../../../Utilities/useGetEnvironment';

const Review = () => {
  const { goToStepById } = useWizardContext();

  const blueprintName = useAppSelector(selectBlueprintName);
  const blueprintDescription = useAppSelector(selectBlueprintDescription);
  const distribution = useAppSelector(selectDistribution);
  const environments = useAppSelector(selectImageTypes);
  const complianceType = useAppSelector(selectComplianceType);
  const complianceProfile = useAppSelector(selectComplianceProfileID);
  const compliancePolicy = useAppSelector(selectCompliancePolicyID);
  const registrationType = useAppSelector(selectRegistrationType);
  const hostname = useAppSelector(selectHostname);
  const languages = useAppSelector(selectLanguages);
  const keyboard = useAppSelector(selectKeyboard);
  const timezone = useAppSelector(selectTimezone);
  const ntpServers = useAppSelector(selectNtpServers);
  const firewall = useAppSelector(selectFirewall);
  const services = useAppSelector(selectServices);
  const users = useAppSelector(selectUsers);
  const kernel = useAppSelector(selectKernel);

  const [isExpandedImageOutput, setIsExpandedImageOutput] = useState(true);
  const [isExpandedTargetEnvs, setIsExpandedTargetEnvs] = useState(true);
  const [isExpandedFSC, setIsExpandedFSC] = useState(true);
  const [isExpandedContent, setIsExpandedContent] = useState(true);
  const [isExpandedRegistration, setIsExpandedRegistration] = useState(true);
  const [isExpandedImageDetail, setIsExpandedImageDetail] = useState(true);
  const [isExpandedOscapDetail, setIsExpandedOscapDetail] = useState(true);
  const [isExpandedComplianceDetail, setIsExpandedComplianceDetail] =
    useState(true);
  const [isExpandedTimezone, setIsExpandedTimezone] = useState(true);
  const [isExpandedLocale, setIsExpandedLocale] = useState(true);
  const [isExpandedHostname, setIsExpandedHostname] = useState(true);
  const [isExpandedKernel, setIsExpandedKernel] = useState(true);
  const [isExpandedFirewall, setIsExpandedFirewall] = useState(true);
  const [isExpandedServices, setIsExpandedServices] = useState(true);
  const [isExpandableFirstBoot, setIsExpandedFirstBoot] = useState(true);
  const [isExpandedUsers, setIsExpandedUsers] = useState(true);

  const isTimezoneEnabled = useFlag('image-builder.timezone.enabled');
  const isLocaleEnabled = useFlag('image-builder.locale.enabled');
  const isHostnameEnabled = useFlag('image-builder.hostname.enabled');
  const isKernelEnabled = useFlag('image-builder.kernel.enabled');
  const isFirewallEnabled = useFlag('image-builder.firewall.enabled');
  const isServicesStepEnabled = useFlag('image-builder.services.enabled');

  const onToggleImageOutput = (isExpandedImageOutput: boolean) =>
    setIsExpandedImageOutput(isExpandedImageOutput);
  const onToggleTargetEnvs = (isExpandedTargetEnvs: boolean) =>
    setIsExpandedTargetEnvs(isExpandedTargetEnvs);
  const onToggleFSC = (isExpandedFSC: boolean) =>
    setIsExpandedFSC(isExpandedFSC);
  const onToggleContent = (isExpandedContent: boolean) =>
    setIsExpandedContent(isExpandedContent);
  const onToggleRegistration = (isExpandedRegistration: boolean) =>
    setIsExpandedRegistration(isExpandedRegistration);
  const onToggleImageDetail = (isExpandedImageDetail: boolean) =>
    setIsExpandedImageDetail(isExpandedImageDetail);
  const onToggleOscapDetails = (isExpandedOscapDetail: boolean) =>
    setIsExpandedOscapDetail(isExpandedOscapDetail);
  const onToggleComplianceDetails = (isExpandedComplianceDetail: boolean) =>
    setIsExpandedComplianceDetail(isExpandedComplianceDetail);
  const onToggleTimezone = (isExpandedTimezone: boolean) =>
    setIsExpandedTimezone(isExpandedTimezone);
  const onToggleLocale = (isExpandedLocale: boolean) =>
    setIsExpandedLocale(isExpandedLocale);
  const onToggleHostname = (isExpandedHostname: boolean) =>
    setIsExpandedHostname(isExpandedHostname);
  const onToggleKernel = (isExpandedKernel: boolean) =>
    setIsExpandedKernel(isExpandedKernel);
  const onToggleFirewall = (isExpandedFirewall: boolean) =>
    setIsExpandedFirewall(isExpandedFirewall);
  const onToggleServices = (isExpandedServices: boolean) =>
    setIsExpandedServices(isExpandedServices);
  const onToggleFirstBoot = (isExpandableFirstBoot: boolean) =>
    setIsExpandedFirstBoot(isExpandableFirstBoot);
  const onToggleUsers = (isExpandedUsers: boolean) =>
    setIsExpandedUsers(isExpandedUsers);

  type RevisitStepButtonProps = {
    ariaLabel: string;
    testId: string;
    stepId: string;
  };

  const RevisitStepButton = ({
    ariaLabel,
    testId,
    stepId,
  }: RevisitStepButtonProps) => {
    return (
      <Button
        variant="link"
        aria-label={ariaLabel}
        data-testid={testId}
        component="span"
        onClick={() => revisitStep(stepId)}
        className="pf-v5-u-p-0 pf-v5-u-font-weight-bold"
        isInline
      >
        Revisit step <ArrowRightIcon />
      </Button>
    );
  };

  const revisitStep = (stepId: string) => {
    goToStepById(stepId);
  };

  const composeExpandable = (label: string, testId: string, stepId: string) => {
    return (
      <TextContent>
        <TextList component={TextListVariants.dl}>
          <TextListItem
            component={TextListItemVariants.dt}
            className="pf-v5-u-min-width pf-v5-u-text-align-left"
          >
            <Button variant="link" component="span" isInline>
              {label}
            </Button>
          </TextListItem>
          <TextListItem component={TextListItemVariants.dd}>
            <RevisitStepButton
              ariaLabel={`Revisit ${label} step`}
              testId={testId}
              stepId={stepId}
            />
          </TextListItem>
        </TextList>
      </TextContent>
    );
  };

  const isFirstBootEnabled = useFlag('image-builder.firstboot.enabled');
  const isUsersEnabled = useFlag('image-builder.users.enabled');
  return (
    <>
      <ExpandableSection
        toggleContent={composeExpandable(
          'Image output',
          'revisit-image-output',
          'step-image-output'
        )}
        onToggle={(_event, isExpandedImageOutput) =>
          onToggleImageOutput(isExpandedImageOutput)
        }
        isExpanded={isExpandedImageOutput}
        isIndented
        data-testid="image-output-expandable"
      >
        <ImageOutputList />
      </ExpandableSection>
      <ExpandableSection
        toggleContent={composeExpandable(
          'Target environments',
          'revisit-target-environments',
          'step-image-output'
        )}
        onToggle={(_event, isExpandedTargetEnvs) =>
          onToggleTargetEnvs(isExpandedTargetEnvs)
        }
        isExpanded={isExpandedTargetEnvs}
        isIndented
        data-testid="target-environments-expandable"
      >
        {environments.includes('aws') && <TargetEnvAWSList />}
        {environments.includes('gcp') && <TargetEnvGCPList />}
        {environments.includes('azure') && <TargetEnvAzureList />}
        {environments.includes('oci') && <TargetEnvOciList />}
        {environments.includes('vsphere') && (
          <TextContent>
            <Text component={TextVariants.h3}>
              {targetOptions.vsphere} (.vmdk)
            </Text>
            <TargetEnvOtherList />
          </TextContent>
        )}
        {environments.includes('vsphere-ova') && (
          <TextContent>
            <Text component={TextVariants.h3}>
              {targetOptions['vsphere-ova']} (.ova)
            </Text>
            <TargetEnvOtherList />
          </TextContent>
        )}
        {environments.includes('guest-image') && (
          <TextContent>
            <Text component={TextVariants.h3}>
              {targetOptions['guest-image']} (.qcow2)
            </Text>
            <TargetEnvOtherList />
          </TextContent>
        )}
        {environments.includes('image-installer') && (
          <TextContent>
            <Text component={TextVariants.h3}>
              {targetOptions['image-installer']} (.iso)
            </Text>
            <TargetEnvOtherList />
          </TextContent>
        )}
        {environments.includes('wsl') && (
          <TextContent>
            <Text component={TextVariants.h3}>
              WSL - {targetOptions.wsl} (.tar.gz)
            </Text>
            <TargetEnvOtherList />
          </TextContent>
        )}
      </ExpandableSection>
      {isRhel(distribution) && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'Registration',
            'revisit-registration',
            'step-register'
          )}
          onToggle={(_event, isExpandedRegistration) =>
            onToggleRegistration(isExpandedRegistration)
          }
          isExpanded={isExpandedRegistration}
          isIndented
          data-testid="registration-expandable"
        >
          {registrationType === 'register-later' && <RegisterLaterList />}
          {registrationType.startsWith('register-now') && <RegisterNowList />}
        </ExpandableSection>
      )}
      {complianceProfile && complianceType === 'openscap' && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'OpenSCAP',
            'revisit-openscap',
            'step-oscap'
          )}
          onToggle={(_event, isExpandedOscapDetail) =>
            onToggleOscapDetails(isExpandedOscapDetail)
          }
          isExpanded={isExpandedOscapDetail}
          isIndented
          data-testid="oscap-detail-expandable"
        >
          <OscapList />
        </ExpandableSection>
      )}
      {compliancePolicy && complianceType === 'compliance' && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'Compliance',
            'revisit-compliance',
            'step-oscap'
          )}
          onToggle={(_event, isExpandedComplianceDetail) =>
            onToggleComplianceDetails(isExpandedComplianceDetail)
          }
          isExpanded={isExpandedComplianceDetail}
          isIndented
          data-testid="compliance-detail-expandable"
        >
          <OscapList />
        </ExpandableSection>
      )}
      <ExpandableSection
        toggleContent={composeExpandable(
          'File system configuration',
          'revisit-file-system',
          'step-file-system'
        )}
        onToggle={(_event, isExpandedFSC) => onToggleFSC(isExpandedFSC)}
        isExpanded={isExpandedFSC}
        isIndented
        data-testid="file-system-configuration-expandable"
      >
        <FSCList />
      </ExpandableSection>
      <ExpandableSection
        toggleContent={composeExpandable(
          'Content',
          'revisit-custom-repositories',
          'wizard-custom-repositories'
        )}
        onToggle={(_event, isExpandedContent) =>
          onToggleContent(isExpandedContent)
        }
        isExpanded={isExpandedContent}
        isIndented
        data-testid="content-expandable"
      >
        <ContentList />
      </ExpandableSection>
      {isUsersEnabled && users.length > 0 && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'Users',
            'revisit-users',
            'wizard-users'
          )}
          onToggle={(_event, isExpandedUsers) => onToggleUsers(isExpandedUsers)}
          isExpanded={isExpandedUsers}
          isIndented
          data-testid="users-expandable"
        >
          <UsersList />
        </ExpandableSection>
      )}
      {isTimezoneEnabled &&
        (timezone || (ntpServers && ntpServers.length > 0)) && (
          <ExpandableSection
            toggleContent={composeExpandable(
              'Timezone',
              'revisit-timezone',
              'wizard-timezone'
            )}
            onToggle={(_event, isExpandedTimezone) =>
              onToggleTimezone(isExpandedTimezone)
            }
            isExpanded={isExpandedTimezone}
            isIndented
            data-testid="timezone-expandable"
          >
            <TimezoneList />
          </ExpandableSection>
        )}
      {isLocaleEnabled &&
        ((languages && languages.length > 0) ||
          (keyboard && keyboard.length > 0)) && (
          <ExpandableSection
            toggleContent={composeExpandable(
              'Locale',
              'revisit-locale',
              'wizard-locale'
            )}
            onToggle={(_event, isExpandedLocale) =>
              onToggleLocale(isExpandedLocale)
            }
            isExpanded={isExpandedLocale}
            isIndented
            data-testid="locale-expandable"
          >
            <LocaleList />
          </ExpandableSection>
        )}
      {isHostnameEnabled && hostname && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'Hostname',
            'revisit-hostname',
            'wizard-hostname'
          )}
          onToggle={(_event, isExpandedHostname) =>
            onToggleHostname(isExpandedHostname)
          }
          isExpanded={isExpandedHostname}
          isIndented
          data-testid="hostname-expandable"
        >
          <HostnameList />
        </ExpandableSection>
      )}
      {isKernelEnabled && (kernel.name || kernel.append.length > 0) && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'Kernel',
            'revisit-kernel',
            'wizard-kernel'
          )}
          onToggle={(_event, isExpandedKernel) =>
            onToggleKernel(isExpandedKernel)
          }
          isExpanded={isExpandedKernel}
          isIndented
          data-testid="kernel-expandable"
        >
          <KernelList />
        </ExpandableSection>
      )}
      {isFirewallEnabled &&
        (firewall.ports.length > 0 ||
          firewall.services.disabled.length > 0 ||
          firewall.services.enabled.length > 0) && (
          <ExpandableSection
            toggleContent={composeExpandable(
              'Firewall',
              'revisit-firewall',
              'wizard-firewall'
            )}
            onToggle={(_event, isExpandedFirewall) =>
              onToggleFirewall(isExpandedFirewall)
            }
            isExpanded={isExpandedFirewall}
            isIndented
            data-testid="firewall-expandable"
          >
            <FirewallList />
          </ExpandableSection>
        )}
      {isServicesStepEnabled &&
        (services.enabled.length > 0 || services.disabled.length > 0) && (
          <ExpandableSection
            toggleContent={composeExpandable(
              'Systemd services',
              'revisit-services',
              'wizard-services'
            )}
            onToggle={(_event, isExpandedServices) =>
              onToggleServices(isExpandedServices)
            }
            isExpanded={isExpandedServices}
            isIndented
            data-testid="services-expandable"
          >
            <ServicesList />
          </ExpandableSection>
        )}
      {isFirstBootEnabled && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'First boot',
            'revisit-first-boot',
            'wizard-first-boot'
          )}
          onToggle={(_event, isExpandableFirstBoot) =>
            onToggleFirstBoot(isExpandableFirstBoot)
          }
          isExpanded={isExpandableFirstBoot}
          isIndented
          data-testid="firstboot-expandable"
        >
          <FirstBootList />
        </ExpandableSection>
      )}
      {(blueprintName || blueprintDescription) && (
        <ExpandableSection
          toggleContent={composeExpandable(
            'Details',
            'revisit-details',
            'step-details'
          )}
          onToggle={(_event, isExpandedImageDetail) =>
            onToggleImageDetail(isExpandedImageDetail)
          }
          isExpanded={isExpandedImageDetail}
          isIndented
          data-testid="image-details-expandable"
        >
          <DetailsList />
        </ExpandableSection>
      )}
    </>
  );
};

export default Review;
