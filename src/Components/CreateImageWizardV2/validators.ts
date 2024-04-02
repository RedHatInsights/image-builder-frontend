import { Partition } from './steps/FileSystem/FileSystemConfiguration';

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
    /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,12}$/.test(gcpShareWithAccount) &&
    gcpShareWithAccount.length <= 253
  );
};

export const isBlueprintNameValid = (blueprintName: string) =>
  blueprintName.length >= 2 &&
  blueprintName.length <= 100 &&
  /\w+/.test(blueprintName);

export const isBlueprintDescriptionValid = (blueprintDescription: string) => {
  return blueprintDescription.length <= 250;
};
export const isFileSystemConfigValid = (partitions: Partition[]) => {
  const duplicates = getDuplicateMountPoints(partitions);
  return duplicates.length === 0;
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
