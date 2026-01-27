export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MANAGER = 'MANAGER',
  CONTROLLER = 'CONTROLLER',
  MECHANIC = 'MECHANIC',
  QC = 'QC',
  PRODUCTION = 'PRODUCTION',
  WAREHOUSE = 'WAREHOUSE',
  ADMIN = 'ADMIN'
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ADMIN]: 90,
  [UserRole.MANAGER]: 80,
  [UserRole.CONTROLLER]: 70,
  [UserRole.QC]: 60,
  [UserRole.PRODUCTION]: 50,
  [UserRole.WAREHOUSE]: 40,
  [UserRole.MECHANIC]: 30,
};
