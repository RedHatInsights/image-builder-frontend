import type { Partition } from './steps/FileSystem/FileSystemTable';

export const isAwsAccountIdValid = (awsAccountId: string | undefined) => {
  return (
    awsAccountId !== undefined &&
    /^\d+$/.test(awsAccountId) &&
    awsAccountId.length === 12
  );
};

export const isAzureTenantGUIDValid = (azureTenantGUID: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    azureTenantGUID
  );
};

export const isAzureSubscriptionIdValid = (azureSubscriptionId: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    azureSubscriptionId
  );
};

export const isAzureResourceGroupValid = (azureResourceGroup: string) => {
  return /^[-\w._()]+[-\w_()]$/.test(azureResourceGroup);
};

export const isGcpEmailValid = (gcpShareWithAccount: string | undefined) => {
  return (
    gcpShareWithAccount !== undefined &&
    /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,12}$/i.test(gcpShareWithAccount) &&
    gcpShareWithAccount.length <= 253
  );
};

export const isMountpointMinSizeValid = (minSize: string) => {
  return /^\d+$/.test(minSize) && parseInt(minSize) > 0;
};

export const isBlueprintNameValid = (blueprintName: string) =>
  blueprintName.length >= 2 &&
  blueprintName.length <= 100 &&
  /\w+/.test(blueprintName);

export const isSnapshotDateValid = (date: Date) => date.getTime() <= Date.now();

export const isSnapshotValid = (dateString: string) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && isSnapshotDateValid(date);
};

export const isBlueprintDescriptionValid = (blueprintDescription: string) => {
  return blueprintDescription.length <= 250;
};

export const isFileSystemConfigValid = (partitions: Partition[]) => {
  const duplicates = getDuplicateMountPoints(partitions);
  return duplicates.length === 0;
};

export const isUserNameValid = (userName: string) => {
  if (!userName) {
    return true;
  }
  const isLengthValid = userName.length <= 32;
  const isNotNumericOnly = !/^\d+$/.test(userName);
  const isPatternValid = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*[a-zA-Z0-9_$]$/.test(
    userName
  );

  return isLengthValid && isNotNumericOnly && isPatternValid;
};

export const isSshKeyValid = (sshKey: string) => {
  if (!sshKey) {
    return true;
  }
  // 1. Key types: ssh-rsa, ssh-dss, ssh-ed25519, or ecdsa-sha2-nistp(256|384|521).
  // 2. Base64-encoded key material.
  // 3. Optional comment at the end.
  const isPatternValid =
    /^(ssh-(rsa|dss|ed25519)|ecdsa-sha2-nistp(256|384|521))\s+[A-Za-z0-9+/=]+(\s+\S+)?$/.test(
      sshKey
    );
  return isPatternValid;
};

export const isPasswordValid = (password: string) => {
  if (!password) {
    return true;
  }
  const isEncrypted = /^\$([^$]+)\$/.test(password);
  const isLengthValid = password.length >= 6 && password.length <= 128;

  if (isEncrypted) return true;
  return isLengthValid;
};

export const getDuplicateMountPoints = (partitions: Partition[]): string[] => {
  const mountPointSet: Set<string> = new Set();
  const duplicates: string[] = [];
  if (!partitions) {
    return [];
  }
  for (const partition of partitions) {
    const mountPoint = partition.mountpoint;
    if (mountPointSet.has(mountPoint)) {
      duplicates.push(mountPoint);
    } else {
      mountPointSet.add(mountPoint);
    }
  }
  return duplicates;
};

export const isNtpServerValid = (ntpServer: string) => {
  return /^([a-z0-9-]+)?(([.:/]{1,3}[a-z0-9-]+)){1,}$/.test(ntpServer);
};

export const isHostnameValid = (hostname: string) => {
  if (!hostname) {
    return true;
  }

  return (
    hostname.length < 65 &&
    /^(([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9-]*[a-z0-9])$/.test(
      hostname
    )
  );
};

export const isKernelNameValid = (kernelName: string) => {
  if (!kernelName) {
    return true;
  }

  return (
    kernelName.length < 65 &&
    /^[a-z0-9]|[a-z0-9][a-z0-9-_.+]*[a-z0-9]$/.test(kernelName)
  );
};

export const isKernelArgumentValid = (arg: string) => {
  if (!arg) {
    return true;
  }

  return /^[a-zA-Z0-9=-_,."']*$/.test(arg);
};

export const isPortValid = (port: string) => {
  return /^(\d{1,5}|[a-z]{1,6})(-\d{1,5})?:[a-z]{1,6}$/.test(port);
};

export const isServiceValid = (service: string) => {
  // see `man systemd.unit` for the exact specification
  return (
    service.length <= 256 &&
    /^[a-zA-Z0-9]([a-zA-Z0-9.\-_:@]*[a-zA-Z0-9])?$/.test(service) &&
    !/--/.test(service) && // does not contain more hyphens in a row
    /[a-zA-Z]+/.test(service) // contains at least one letter
  );
};
