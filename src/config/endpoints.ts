export const endpointMap = {
  auth: {
    login: '/api/users/sign_in',
    logout: '/api/users/sign_out'
  },
  apiReports: {
    getLocations: '/api/reports/get_locations',
    getDeviceCountAll: '/api/reports/get_device_count_all',
    getDeviceCount: '/api/reports/get_device_count',
    modelNumbers: '/api/reports/model_numbers',
    openPorts: '/api/reports/open_ports',
    vaptCounts: '/api/reports/vapt_counts',
    alerts: '/api/reports/alerts',
    vulnerableHosts: '/api/reports/vulnerable_hosts'
  },
  reportDetails: {
    scanDetails: '/reports/api_scan_details',
    cveDetails: '/reports/api_cve_details',
    cweDetails: '/reports/api_cwe_details',
    deviceDetails: '/reports/api_device_details'
  },
  tenants: {
    list: '/tenants',
    create: '/tenants',
    getById: '/tenants/:id',
    updateById: '/tenants/:id',
    patchById: '/tenants/:id',
    deleteById: '/tenants/:id'
  },
  devices: {
    list: '/devices',
    create: '/devices',
    getById: '/devices/:id',
    updateById: '/devices/:id',
    patchById: '/devices/:id',
    deleteById: '/devices/:id',
    registeredAsset: '/devices/registered_asset',
    resyncAssets: '/devices/resync_assets',
    batchUpdateTag: '/devices/batch_update_tag',
    truncate: '/devices/truncate'
  },
  discoveries: {
    list: '/discoveries',
    create: '/discoveries',
    getById: '/discoveries/:id',
    updateById: '/discoveries/:id',
    patchById: '/discoveries/:id',
    deleteById: '/discoveries/:id',
    toggleScanStatus: '/discoveries/:id/toggle_scan_status',
    status: '/discoveries/status',
    detailedStatus: '/discoveries/detailed_status',
    checkScheduleConflict: '/discoveries/check_schedule_conflict'
  },
  users: {
    list: '/users',
    create: '/users',
    getById: '/users/:id',
    updateById: '/users/:id',
    patchById: '/users/:id',
    deleteById: '/users/:id',
    createLegacy: '/create_user',
    updateLegacy: '/update_user'
  },
  diagnostics: {
    list: '/diagnostics',
    create: '/diagnostics',
    getById: '/diagnostics/:id',
    patchById: '/diagnostics/:id',
    deleteById: '/diagnostics/:id',
    stopById: '/diagnostics/:id/stop'
  },
  diagnosticsMeta: {
    list: '/diagnostics_meta_data',
    create: '/diagnostics_meta_data',
    getById: '/diagnostics_meta_data/:id',
    patchById: '/diagnostics_meta_data/:id',
    deleteById: '/diagnostics_meta_data/:id',
    rescanById: '/diagnostics_meta_data/:id/rescan'
  },
  oemSignatures: {
    list: '/oemsignatures',
    create: '/oemsignatures',
    getById: '/oemsignatures/:id',
    patchById: '/oemsignatures/:id',
    deleteById: '/oemsignatures/:id',
    createSignature: '/oemsignatures/create_oem_signature',
    signatureImport: '/oemsignatures/signature_import'
  },
  uptimeMonitoring: {
    list: '/asset_upmon',
    create: '/asset_upmon',
    getById: '/asset_upmon/:id',
    patchById: '/asset_upmon/:id',
    deleteById: '/asset_upmon/:id',
    addServerDetails: '/asset_upmon/add_server_details',
    serverDetail: '/asset_upmon/server_detail',
    setFrequency: '/asset_upmon/set_frequency',
    graph: '/asset_upmon/upmmon_graph'
  },
  assetGroupManagement: {
    list: '/assetgroupmasters',
    create: '/assetgroupmasters',
    getById: '/assetgroupmasters/:id',
    patchById: '/assetgroupmasters/:id',
    deleteById: '/assetgroupmasters/:id',
    toggleActivation: '/assetgroupmasters/:id/toggle_activation'
  },
  appUpdateHistory: {
    list: '/update_app_histories',
    create: '/update_app_histories',
    getById: '/update_app_histories/:id',
    patchById: '/update_app_histories/:id',
    deleteById: '/update_app_histories/:id',
    updateType: '/update_type'
  },
  integrators: {
    list: '/integrators',
    create: '/integrators',
    getById: '/integrators/:id',
    patchById: '/integrators/:id',
    deleteById: '/integrators/:id'
  },
  discoveryTemplates: {
    list: '/discoverytemplates',
    create: '/discoverytemplates',
    getById: '/discoverytemplates/:id',
    patchById: '/discoverytemplates/:id',
    deleteById: '/discoverytemplates/:id'
  },
  zipUploads: {
    list: '/zip_uploads',
    create: '/zip_uploads',
    getById: '/zip_uploads/:id',
    patchById: '/zip_uploads/:id',
    deleteById: '/zip_uploads/:id'
  },
  cweResults: {
    list: '/cwetestresults',
    create: '/cwetestresults',
    getById: '/cwetestresults/:id',
    patchById: '/cwetestresults/:id',
    deleteById: '/cwetestresults/:id'
  },
  homeDashboards: {
    list: '/homes',
    create: '/homes',
    getById: '/homes/:id',
    patchById: '/homes/:id',
    deleteById: '/homes/:id',
    assetDiscoveryDashboard: '/homes/asset_discovery_dashboard',
    assetMonitoring: '/homes/asset_monitoring',
    externalSurface: '/homes/externalsurface',
    globalDashboard: '/homes/global_dashboard',
    threatMonitor: '/homes/threatmonitor',
    uptimeMonitoringDashboard: '/homes/uptime_monitoring_dashboard'
  },
  comparisonDashboard: {
    index: '/comparison_dashboard',
    fetchComparisonData: '/comparison_dashboard/fetch_comparison_data',
    exportQuarterlyVulnerability: '/export_quaterly_vulnerability',
    fetchVulnerabilityDetails: '/fetch_vuln_details',
    quarterlyDetails: '/quarterly_details',
    quarterlyVulnerabilityDashboard: '/quaterly_vulnerability_dashboard'
  },
  applicationUtilities: {
    setTimezone: '/set_timezone',
    deleteExportFile: '/delete_export_file'
  },
  otpWeb: {
    resendOtp: '/resend_otp',
    verifyOtpGet: '/verify_otp',
    verifyOtpPost: '/verify_otp'
  },
  other: {
    password: '/api/users/password',
    passwordEdit: '/api/users/password/edit',
    passwordNew: '/api/users/password/new',
    destroy: '/destroy',
    edit: '/edit',
    update: '/update',
    reports: '/reports',
    reportsById: '/reports/:id',
    reportsEditById: '/reports/:id/edit',
    reportsExport: '/reports/export',
    reportsDetail: '/reports/detail',
    reportsDetailedStatus: '/reports/detailed_status',
    reportsExportAlerts: '/reports/export_alerts',
    reportsExportAlertsFileStatus: '/reports/export_alerts_file_status',
    reportsGenIsoReport: '/reports/gen_iso_report',
    reportsGenReport: '/reports/gen_report',
    reportsHostprofile: '/reports/hostprofile',
    reportsMasterResults: '/reports/master_results',
    reportsNew: '/reports/new',
    reportsSaveEvidence: '/reports/save_evidence'
  }
} as const;

export type EndpointMap = typeof endpointMap;
