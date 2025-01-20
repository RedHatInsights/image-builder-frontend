/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Method, Headers, Params } from '../../../store/cockpitTypes';

type userinfo = {
  home: string;
};

type requestOptions = {
  path: string;
  method: Method;
  body: unknown;
  headers: Headers | undefined;
  params: Params | undefined;
};

export default {
  user: (): Promise<userinfo> => {
    return new Promise((resolve) => {
      resolve({
        home: '',
      });
    });
  },
  file: (path: string) => {
    return {
      read: (): Promise<string> => {
        return new Promise((resolve) => {
          resolve('');
        });
      },
      close: () => {},
    };
  },
  spawn: (args: string[], attributes: object): Promise<string | Uint8Array> => {
    return new Promise((resolve) => {
      resolve('');
    });
  },
  http: (path: string, attributes: object) => {
    return {
      request: (request: requestOptions): Promise<string> => {
        return new Promise((resolve) => {
          resolve('');
        });
      },
    };
  },
};
