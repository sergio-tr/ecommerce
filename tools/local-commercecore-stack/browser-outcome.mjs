/**
 * Allowlisted result lines for the required three-app browser pass.
 * Anything other than PASS becomes FAIL. A skip is never a pass, and the
 * line cannot carry page text, ids, labels, ports, or URLs.
 */

const STAGES = new Set(['preflight', 'startup', 'debugger', 'page', 'cloud', 'cleanup']);

const REASONS = new Set([
  'build-missing',
  'chrome-missing',
  'web-build-missing',
  'port-unavailable',
  'fixture-rejected',
  'core-liveness-timed-out',
  'cloud-liveness-timed-out',
  'core-exited',
  'cloud-exited',
  'chrome-exited',
  'chrome-debugger-timed-out',
  'chrome-socket-failed',
  'cdp-timed-out',
  'cdp-call-failed',
  'empty-state-missing',
  'process-local-note-missing',
  'commercial-text-present',
  'title-mismatch',
  'create-field-missing',
  'create-control-missing',
  'created-entry-missing',
  'discovery-missing',
  'search-field-missing',
  'sort-control-missing',
  'search-did-not-filter',
  'clear-search-missing',
  'search-reset',
  'sort-order-mismatch',
  'match-count-missing',
  'no-match-state-missing',
  'search-not-preserved',
  'duplicate-alert-missing',
  'duplicate-cleared-input',
  'edit-control-missing',
  'revision-not-loaded',
  'update-field-missing',
  'save-control-missing',
  'updated-entry-missing',
  'revision-field-missing',
  'stale-alert-missing',
  'stale-cleared-input',
  'recover-missing',
  'recover-control-missing',
  'recovered-revision-missing',
  'recovered-draft-changed',
  'recover-wrote-entry',
  'recovered-save-missing',
  'stale-status-stayed',
  'reload-control-missing',
  'reload-error-missing',
  'error-alert-missing',
  'rejected-alert-missing',
  'rejected-value-echoed',
  'rejected-label-cleared',
  'page-script-failed',
  'cloud-down-before-core-stop',
  'cloud-down-after-core-stop',
  'closed-route-present',
  'tenant-header-echoed',
  'commercial-field-present',
  'port-stayed-bound',
  'child-still-running',
  'unclassified',
]);

const MESSAGE_TO = new Map([
  ['build missing', ['preflight', 'build-missing']],
  ['chrome missing', ['preflight', 'chrome-missing']],
  ['web build missing', ['preflight', 'web-build-missing']],
  ['port unavailable', ['preflight', 'port-unavailable']],
  ['fixture rejected', ['preflight', 'fixture-rejected']],
  ['core liveness timed out', ['startup', 'core-liveness-timed-out']],
  ['cloud liveness timed out', ['startup', 'cloud-liveness-timed-out']],
  ['core exited', ['startup', 'core-exited']],
  ['cloud exited', ['startup', 'cloud-exited']],
  ['api exited before the browser smoke', ['startup', 'core-exited']],
  ['api liveness timed out', ['startup', 'core-liveness-timed-out']],
  ['chrome exited', ['debugger', 'chrome-exited']],
  ['chrome debugger timed out', ['debugger', 'chrome-debugger-timed-out']],
  ['chrome socket failed', ['debugger', 'chrome-socket-failed']],
  ['cdp timed out', ['debugger', 'cdp-timed-out']],
  ['cdp call failed', ['debugger', 'cdp-call-failed']],
  ['empty state missing', ['page', 'empty-state-missing']],
  ['process-local note missing', ['page', 'process-local-note-missing']],
  ['commercial text present', ['page', 'commercial-text-present']],
  ['document title mismatch', ['page', 'title-mismatch']],
  ['create id field missing', ['page', 'create-field-missing']],
  ['create label field missing', ['page', 'create-field-missing']],
  ['create button missing', ['page', 'create-control-missing']],
  ['created entry missing', ['page', 'created-entry-missing']],
  ['search field missing', ['page', 'search-field-missing']],
  ['sort control missing', ['page', 'sort-control-missing']],
  ['search did not filter', ['page', 'search-did-not-filter']],
  ['clear search missing', ['page', 'clear-search-missing']],
  ['search reset', ['page', 'search-reset']],
  ['sort order mismatch', ['page', 'sort-order-mismatch']],
  ['match count missing', ['page', 'match-count-missing']],
  ['no-match state missing', ['page', 'no-match-state-missing']],
  ['search not preserved', ['page', 'search-not-preserved']],
  ['duplicate alert missing', ['page', 'duplicate-alert-missing']],
  ['duplicate cleared the product id', ['page', 'duplicate-cleared-input']],
  ['edit button missing', ['page', 'edit-control-missing']],
  ['edit did not load revision 1', ['page', 'revision-not-loaded']],
  ['update label field missing', ['page', 'update-field-missing']],
  ['save button missing', ['page', 'save-control-missing']],
  ['updated entry missing', ['page', 'updated-entry-missing']],
  ['revision field missing', ['page', 'revision-field-missing']],
  ['stale alert missing', ['page', 'stale-alert-missing']],
  ['stale revision was cleared', ['page', 'stale-cleared-input']],
  ['recover control missing', ['page', 'recover-control-missing']],
  ['recovered revision missing', ['page', 'recovered-revision-missing']],
  ['recovered draft changed', ['page', 'recovered-draft-changed']],
  ['recover wrote the entry', ['page', 'recover-wrote-entry']],
  ['recovered save missing', ['page', 'recovered-save-missing']],
  ['stale status stayed', ['page', 'stale-status-stayed']],
  ['reload button missing', ['page', 'reload-control-missing']],
  ['reload error missing', ['page', 'reload-error-missing']],
  ['error alert missing', ['page', 'error-alert-missing']],
  ['rejected alert missing', ['page', 'rejected-alert-missing']],
  ['rejected value echoed', ['page', 'rejected-value-echoed']],
  ['rejected label cleared', ['page', 'rejected-label-cleared']],
  ['page script failed', ['page', 'page-script-failed']],
  ['cloud down before core stop', ['cloud', 'cloud-down-before-core-stop']],
  ['cloud down after core stop', ['cloud', 'cloud-down-after-core-stop']],
  ['closed route present', ['cloud', 'closed-route-present']],
  ['tenant header echoed', ['cloud', 'tenant-header-echoed']],
  ['commercial field present', ['cloud', 'commercial-field-present']],
  ['port stayed bound', ['cleanup', 'port-stayed-bound']],
  ['child still running', ['cleanup', 'child-still-running']],
]);

export function classifyBrowserFailure(error) {
  const message = error instanceof Error ? error.message : '';
  const mapped = MESSAGE_TO.get(message);
  if (!mapped) {
    return { status: 'FAIL', stage: 'unknown', reason: 'unclassified' };
  }
  return { status: 'FAIL', stage: mapped[0], reason: mapped[1] };
}

export function preflightFrom({ apiBuilt, cloudBuilt, chrome, webBuilt }) {
  if (!apiBuilt || !cloudBuilt) {
    return { status: 'FAIL', stage: 'preflight', reason: 'build-missing' };
  }
  if (!chrome) {
    return { status: 'FAIL', stage: 'preflight', reason: 'chrome-missing' };
  }
  if (!webBuilt) {
    return { status: 'FAIL', stage: 'preflight', reason: 'web-build-missing' };
  }
  return null;
}

export function requiredBrowserLine(result) {
  if (result?.status === 'PASS') {
    if (result.search !== 'shown' || result.sort !== 'shown') {
      return {
        exitCode: 1,
        line: 'browser-smoke: FAIL stage=page reason=discovery-missing',
      };
    }
    if (result.recover !== 'shown') {
      return {
        exitCode: 1,
        line: 'browser-smoke: FAIL stage=page reason=recover-missing',
      };
    }
    const loading = result.loading === 'shown' ? 'shown' : 'not-observed';
    return {
      exitCode: 0,
      line:
        'browser-smoke: PASS empty=shown list=shown error=shown duplicate-alert=shown ' +
        'stale-alert=shown rejected-echo=absent commercial=absent cloud-before=live ' +
        `cloud-after=live loading=${loading} search=shown sort=shown recover=shown`,
    };
  }
  const stage = STAGES.has(result?.stage) ? result.stage : 'unknown';
  const reason = REASONS.has(result?.reason) ? result.reason : 'unclassified';
  return {
    exitCode: 1,
    line: `browser-smoke: FAIL stage=${stage} reason=${reason}`,
  };
}
