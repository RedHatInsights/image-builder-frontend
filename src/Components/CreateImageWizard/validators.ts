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
  if (userName === undefined) return false;
  const isLengthValid = userName.length <= 32;
  const isNotNumericOnly = !/^\d+$/.test(userName);
  const isPatternValid = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*[a-zA-Z0-9_$]$/.test(
    userName
  );

  return isLengthValid && isNotNumericOnly && isPatternValid;
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

export const isPortValid = (port: string) => {
  return /^(\d{1,5}|[a-z]{1,6})(-\d{1,5})?:[a-z]{1,6}$/.test(port);
};
