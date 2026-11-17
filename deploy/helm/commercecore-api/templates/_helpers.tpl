{{- define "commercecore-api.name" -}}
commercecore-api
{{- end -}}

{{- define "commercecore-api.fullname" -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "commercecore-api.labels" -}}
app.kubernetes.io/name: {{ include "commercecore-api.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/part-of: commercecore
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/component: api
{{- end -}}

{{- define "commercecore-api.selectorLabels" -}}
app.kubernetes.io/name: {{ include "commercecore-api.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
