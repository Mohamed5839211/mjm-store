/**
 * Auth Constants for MJM Store
 */

export const AUTH_KEYS = {
    TOKEN: 'mjm_token',
    USER: 'mjm_user',
    REFRESH_TOKEN: 'mjm_refresh_token',
};

export const ROUTES = {
    HOME: '/',
    ADMIN_LOGIN: '/mjm',
    CUSTOMER_LOGIN: '/auth/login',
    ADMIN_DASHBOARD: '/admin',
    PROFILE: '/profile',
    CHECKOUT: '/checkout',
};

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    MANAGER: 'manager',
    STAFF: 'staff',
    CUSTOMER: 'customer',
};

export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.MANAGER, ROLES.STAFF];
