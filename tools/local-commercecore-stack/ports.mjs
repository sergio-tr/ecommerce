import { portBusy } from '../local-egame-fullstack/children.mjs';

/**
 * Fixed loopback ports for the developer stack.
 * 3100 is the CommerceCloud port already used by public-config.spec.ts.
 * 3000 and 4200 stay the CommerceCore API and eGame dev server.
 */
export const API_PORT = 3000;
export const WEB_PORT = 4200;
export const CLOUD_PORT = 3100;

export const STACK_PORTS = [API_PORT, WEB_PORT, CLOUD_PORT];

export async function busyStackPort() {
  let busy = null;
  for (const port of STACK_PORTS) {
    if (busy === null && (await portBusy(port))) {
      busy = port;
    }
  }
  return busy;
}
