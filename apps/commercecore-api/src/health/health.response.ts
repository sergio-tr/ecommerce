export interface HealthLiveResponse {
  readonly status: 'live';
  readonly service: 'commercecore-api';
  readonly version: string;
  readonly probe: 'liveness';
  readonly dependenciesChecked: false;
}

export function healthLiveResponse(version: string): HealthLiveResponse {
  return Object.freeze({
    status: 'live',
    service: 'commercecore-api',
    version,
    probe: 'liveness',
    dependenciesChecked: false,
  });
}
