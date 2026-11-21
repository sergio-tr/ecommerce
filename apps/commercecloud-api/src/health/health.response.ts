export interface HealthLiveResponse {
  readonly status: 'live';
  readonly service: 'commercecloud-api';
  readonly version: string;
  readonly probe: 'liveness';
  readonly dependenciesChecked: false;
}

export function healthLiveResponse(version: string): HealthLiveResponse {
  return Object.freeze({
    status: 'live',
    service: 'commercecloud-api',
    version,
    probe: 'liveness',
    dependenciesChecked: false,
  });
}
