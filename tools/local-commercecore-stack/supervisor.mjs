import { stopGroup } from '../local-egame-fullstack/children.mjs';

/**
 * Tracks only the process groups this stack spawned.
 * Stopping it does not signal any other process.
 */
export function createSupervisor() {
  const owned = [];
  let stopping = false;

  return {
    own(record) {
      owned.push(record);
      return record;
    },
    anyExited() {
      return owned.some((record) => record.exited());
    },
    async stopOwned() {
      if (stopping) {
        return;
      }
      stopping = true;
      for (const record of owned) {
        await stopGroup(record);
      }
    },
  };
}
