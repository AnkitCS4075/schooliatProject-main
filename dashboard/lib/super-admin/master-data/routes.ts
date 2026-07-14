export const MASTER_DATA_BASE_PATH = "/super-admin/master-data";

export const MASTER_DATA_ROUTES = {
  workspace: MASTER_DATA_BASE_PATH,
  regionsTab: `${MASTER_DATA_BASE_PATH}?tab=regions`,
  locationsTab: `${MASTER_DATA_BASE_PATH}?tab=locations`,
  /** Schools roster for a region */
  regionSchools: (regionId: string) =>
    `${MASTER_DATA_BASE_PATH}/regions/${regionId}`,
  schoolProfile: (schoolId: string) =>
    `${MASTER_DATA_BASE_PATH}/schools/${schoolId}`,
} as const;
