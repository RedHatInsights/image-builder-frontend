import { useEffect, useState } from 'react';

import { UNIQUE_VALIDATION_DELAY } from '../../../constants';
import { useLazyGetBlueprintsQuery } from '../../../store/backendApi';
import { useAppSelector } from '../../../store/hooks';
import { BlueprintsResponse } from '../../../store/imageBuilderApi';
import {
  useListActivationKeysQuery,
  useShowActivationKeyQuery,
} from '../../../store/rhsmApi';
import {
  selectBlueprintId,
  selectBlueprintName,
  selectBlueprintDescription,
  selectFileSystemConfigurationType,
  selectFirstBootScript,
  selectPartitions,
  selectSnapshotDate,
  selectUseLatest,
  selectActivationKey,
  selectRegistrationType,
  selectHostname,
  selectKernel,
  selectUserNameByIndex,
  selectUsers,
  selectUserPasswordByIndex,
  selectUserSshKeyByIndex,
  selectNtpServers,
  selectFirewall,
  selectServices,
  selectLanguages,
  selectKeyboard,
} from '../../../store/wizardSlice';
import { keyboardsList } from '../steps/Locale/keyboardsList';
import { languagesList } from '../steps/Locale/languagesList';
import {
  getDuplicateMountPoints,
  isBlueprintNameValid,
  isBlueprintDescriptionValid,
  isMountpointMinSizeValid,
  isSnapshotValid,
  isHostnameValid,
  isKernelNameValid,
  isUserNameValid,
  isSshKeyValid,
  isNtpServerValid,
  isKernelArgumentValid,
  isPortValid,
  isServiceValid,
  isPasswordValid,
} from '../validators';

export type StepValidation = {
  errors: {
    [key: string]: string;
  };
  disabledNext: boolean;
};

export function useIsBlueprintValid(): boolean {
  const registration = useRegistrationValidation();
  const filesystem = useFilesystemValidation();
  const snapshot = useSnapshotValidation();
  const timezone = useTimezoneValidation();
  const locale = useLocaleValidation();
  const hostname = useHostnameValidation();
  const kernel = useKernelValidation();
  const firewall = useFirewallValidation();
  const services = useServicesValidation();
  const firstBoot = useFirstBootValidation();
  const details = useDetailsValidation();
  const users = useUsersValidation();
  return (
    !registration.disabledNext &&
    !filesystem.disabledNext &&
    !snapshot.disabledNext &&
    !timezone.disabledNext &&
    !locale.disabledNext &&
    !hostname.disabledNext &&
    !kernel.disabledNext &&
    !firewall.disabledNext &&
    !services.disabledNext &&
    !firstBoot.disabledNext &&
    !details.disabledNext &&
    !users.disabledNext
  );
}

export function useRegistrationValidation(): StepValidation {
  const registrationType = useAppSelector(selectRegistrationType);
  const activationKey = useAppSelector(selectActivationKey);

  const {
    isUninitialized,
    isFetching: isFetchingKeys,
    isError: isErrorKeys,
  } = useListActivationKeysQuery();

  const { isFetching: isFetchingKeyInfo, isError: isErrorKeyInfo } =
    useShowActivationKeyQuery(
      { name: activationKey! },
      {
        skip: !activationKey,
      }
    );

  if (registrationType !== 'register-later' && !activationKey) {
    if (isUninitialized || isFetchingKeys || !isErrorKeys) {
      return { errors: {}, disabledNext: false };
    }
    return {
      errors: { activationKey: 'No activation key selected' },
      disabledNext: true,
    };
  }

  if (
    registrationType !== 'register-later' &&
    activationKey &&
    (isFetchingKeyInfo || isErrorKeyInfo)
  ) {
    return {
      errors: { activationKey: 'Invalid activation key' },
      disabledNext: true,
    };
  }

  return { errors: {}, disabledNext: false };
}

export function useFilesystemValidation(): StepValidation {
  const mode = useAppSelector(selectFileSystemConfigurationType);
  const partitions = useAppSelector(selectPartitions);
  let disabledNext = false;

  const errors: { [key: string]: string } = {};
  if (mode === 'automatic') {
    return { errors, disabledNext: false };
  }

  const duplicates = getDuplicateMountPoints(partitions);
  for (const partition of partitions) {
    if (!isMountpointMinSizeValid(partition.min_size)) {
      errors[`min-size-${partition.id}`] = 'Must be larger than 0';
      disabledNext = true;
    }
    if (duplicates.includes(partition.mountpoint)) {
      errors[`mountpoint-${partition.id}`] = 'Duplicate mount points';
      disabledNext = true;
    }
  }
  return { errors, disabledNext };
}

export function useSnapshotValidation(): StepValidation {
  const snapshotDate = useAppSelector(selectSnapshotDate);
  const useLatest = useAppSelector(selectUseLatest);

  if (!useLatest && !isSnapshotValid(snapshotDate)) {
    return {
      errors: { snapshotDate: 'Invalid snapshot date' },
      disabledNext: true,
    };
  }
  return { errors: {}, disabledNext: false };
}

export function useTimezoneValidation(): StepValidation {
  const ntpServers = useAppSelector(selectNtpServers);

  if (ntpServers) {
    const invalidServers = [];

    for (const server of ntpServers) {
      if (!isNtpServerValid(server)) {
        invalidServers.push(server);
      }
    }

    if (invalidServers.length > 0) {
      return {
        errors: { ntpServers: `Invalid ntpServers: ${invalidServers}` },
        disabledNext: true,
      };
    }
  }

  return { errors: {}, disabledNext: false };
}

export function useLocaleValidation(): StepValidation {
  const languages = useAppSelector(selectLanguages);
  const keyboard = useAppSelector(selectKeyboard);

  const errors = {};
  const unknownLanguages = [];

  if (languages && languages.length > 0) {
    for (const lang of languages) {
      if (!languagesList.includes(lang)) {
        unknownLanguages.push(lang);
      }
    }

    if (unknownLanguages.length > 0) {
      Object.assign(errors, {
        languages: unknownLanguages.join(' '),
      });
    }
  }

  if (keyboard && !keyboardsList.includes(keyboard)) {
    Object.assign(errors, { keyboard: 'Unknown keyboard' });
  }

  return {
    errors,
    disabledNext: unknownLanguages.length > 0 || 'keyboard' in errors,
  };
}

export function useFirstBootValidation(): StepValidation {
  const script = useAppSelector(selectFirstBootScript);
  let hasShebang = false;
  if (script) {
    hasShebang = script.split('\n')[0].startsWith('#!');
  }
  const valid = !script || hasShebang;
  return {
    errors: {
      script: valid ? '' : 'Missing shebang at first line, e.g. #!/bin/bash',
    },
    disabledNext: !valid,
  };
}

export function useHostnameValidation(): StepValidation {
  const hostname = useAppSelector(selectHostname);

  // Error message taken from hostname man page (`man 5 hostname`)
  const errorMessage =
    'Invalid hostname. The hostname should be composed of up to 64 7-bit ASCII lower-case alphanumeric characters or hyphens forming a valid DNS domain name. It is recommended that this name contains only a single label, i.e. without any dots.';

  if (!isHostnameValid(hostname)) {
    return {
      errors: {
        hostname: errorMessage,
      },
      disabledNext: true,
    };
  }
  return { errors: {}, disabledNext: false };
}

export function useKernelValidation(): StepValidation {
  const kernel = useAppSelector(selectKernel);

  if (!isKernelNameValid(kernel.name)) {
    return {
      errors: {
        kernel: 'Invalid format.',
      },
      disabledNext: true,
    };
  }

  if (kernel.append.length > 0) {
    const invalidArgs = [];

    for (const arg of kernel.append) {
      if (!isKernelArgumentValid(arg)) {
        invalidArgs.push(arg);
      }
    }

    if (invalidArgs.length > 0) {
      return {
        errors: { kernelAppend: `Invalid kernel arguments: ${invalidArgs}` },
        disabledNext: true,
      };
    }
  }

  return { errors: {}, disabledNext: false };
}

export function useFirewallValidation(): StepValidation {
  const firewall = useAppSelector(selectFirewall);
  const errors = {};
  const invalidPorts = [];
  const invalidDisabled = [];
  const invalidEnabled = [];

  if (firewall.ports.length > 0) {
    for (const port of firewall.ports) {
      if (!isPortValid(port)) {
        invalidPorts.push(port);
      }
    }

    if (invalidPorts.length > 0) {
      Object.assign(errors, { ports: `Invalid ports: ${invalidPorts}` });
    }
  }

  if (firewall.services.disabled.length > 0) {
    for (const s of firewall.services.disabled) {
      if (!isServiceValid(s)) {
        invalidDisabled.push(s);
      }
    }

    if (invalidDisabled.length > 0) {
      Object.assign(errors, {
        disabledServices: `Invalid disabled services: ${invalidDisabled}`,
      });
    }
  }

  if (firewall.services.enabled.length > 0) {
    for (const s of firewall.services.enabled) {
      if (!isServiceValid(s)) {
        invalidEnabled.push(s);
      }
    }

    if (invalidEnabled.length > 0) {
      Object.assign(errors, {
        enabledServices: `Invalid enabled services: ${invalidEnabled}`,
      });
    }
  }

  return {
    errors,
    disabledNext:
      invalidPorts.length > 0 ||
      invalidDisabled.length > 0 ||
      invalidEnabled.length > 0,
  };
}

export function useServicesValidation(): StepValidation {
  const services = useAppSelector(selectServices);
  const errors = {};
  const invalidDisabled = [];
  const invalidEnabled = [];

  if (services.disabled.length > 0) {
    for (const s of services.disabled) {
      if (!isServiceValid(s)) {
        invalidDisabled.push(s);
      }
    }

    if (invalidDisabled.length > 0) {
      Object.assign(errors, {
        disabledSystemdServices: `Invalid disabled services: ${invalidDisabled}`,
      });
    }
  }

  if (services.enabled.length > 0) {
    for (const s of services.enabled) {
      if (!isServiceValid(s)) {
        invalidEnabled.push(s);
      }
    }

    if (invalidEnabled.length > 0) {
      Object.assign(errors, {
        enabledSystemdServices: `Invalid enabled services: ${invalidEnabled}`,
      });
    }
  }

  return {
    errors,
    disabledNext: invalidDisabled.length > 0 || invalidEnabled.length > 0,
  };
}

export function useUsersValidation(): StepValidation {
  const index = 0;
  const userNameSelector = selectUserNameByIndex(index);
  const userName = useAppSelector(userNameSelector);
  const userPasswordSelector = selectUserPasswordByIndex(index);
  const userPassword = useAppSelector(userPasswordSelector);
  const userSshKeySelector = selectUserSshKeyByIndex(index);
  const userSshKey = useAppSelector(userSshKeySelector);
  const users = useAppSelector(selectUsers);
  const canProceed =
    // Case 1: there is no users
    users.length === 0 ||
    // Case 2: All fields are empty
    (userName === '' && userPassword === '' && userSshKey === '') ||
    // Case 3: userName is valid and SshKey or Password is valid
    (userName &&
      isUserNameValid(userName) &&
      ((userSshKey && isSshKeyValid(userSshKey)) ||
        (userPassword && isPasswordValid(userPassword))));

  let userNameError = '';
  let passError = '';
  let sshKeyError = '';
  let disabledNext = !canProceed;
  if (!isUserNameValid(userName)) {
    userNameError = 'Invalid user name';
    disabledNext = true;
  } else if (!userName) {
    userNameError = 'default';
  }
  if (!isPasswordValid(userPassword)) {
    passError = 'Password must be between 6 and 128 characters';
    disabledNext = true;
  } else if (!userPassword) {
    passError = '';
  }
  if (!isSshKeyValid(userSshKey)) {
    sshKeyError = 'Invalid SSH key';
    disabledNext = true;
  } else if (!userSshKey) {
    sshKeyError = '';
  }

  return {
    errors: {
      userName: userNameError,
      userPassword: passError,
      userSshKey: sshKeyError,
    },
    disabledNext: disabledNext,
  };
}

export function useDetailsValidation(): StepValidation {
  const name = useAppSelector(selectBlueprintName);
  const description = useAppSelector(selectBlueprintDescription);
  const blueprintId = useAppSelector(selectBlueprintId);

  const nameValid = isBlueprintNameValid(name);
  const descriptionValid = isBlueprintDescriptionValid(description);
  const [uniqueName, setUniqueName] = useState<boolean | null>(null);

  const [trigger] = useLazyGetBlueprintsQuery();

  // Debounce the API call to check if the name is unique
  useEffect(() => {
    if (name !== '' && nameValid) {
      const timer = setTimeout(
        () => {
          setUniqueName(null);
          trigger({ name })
            .unwrap()
            .then((response: BlueprintsResponse) => {
              if (
                response?.meta?.count > 0 &&
                response.data[0].id !== blueprintId
              ) {
                setUniqueName(false);
              } else {
                setUniqueName(true);
              }
            })
            .catch(() => {
              // If the request fails, we assume the name is unique
              setUniqueName(true);
            });
        },
        UNIQUE_VALIDATION_DELAY // If name is empty string, instantly return
      );

      return () => {
        clearTimeout(timer);
      };
    }
  }, [blueprintId, name, setUniqueName, trigger, nameValid]);

  let nameError = '';
  if (name && !nameValid) {
    nameError = 'Invalid blueprint name';
  } else if (uniqueName === false) {
    nameError = 'Blueprint with this name already exists';
  } else if (!blueprintId && uniqueName === null) {
    // Hack to keep the error message from flickering in create mode
    return { errors: { name: '' }, disabledNext: false };
  }

  return {
    errors: {
      name: nameError,
      description: descriptionValid ? '' : 'Invalid description',
    },
    // if uniqueName is null, we are still waiting for the API response
    disabledNext: !!nameError || !descriptionValid || uniqueName !== true,
  };
}
