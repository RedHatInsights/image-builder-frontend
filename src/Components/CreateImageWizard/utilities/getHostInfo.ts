import cockpit from 'cockpit';
import { read_os_release } from 'os-release';

import { Distributions } from '../../../store/imageBuilderApi';

export const getHostDistro = async () => {
  const osRel = await read_os_release();
  let distro = `${osRel.ID}-${osRel.VERSION_ID}`;
  // use major releases, and rely on composer's distro aliasing (rhel)
  if (distro.indexOf('.') !== -1) {
    distro = distro.split('.')[0];
  }
  return distro as Distributions;
};

type Architecture = 'x86_64' | 'aarch64';
export const getHostArch = async () => {
  const hostArch = await cockpit.spawn(['uname', '-m'], {
    superuser: 'try',
  });

  return (hostArch as string).trim() as Architecture;
};
