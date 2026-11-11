
import { getContext } from "svelte";
import { authService } from "../services/auth.js";
import { ApiError } from "../services/api.js";

export const AUTH_CONTEXT = Symbol("agrimama-auth");

/**
 * @typedef {Object} AuthUser
 * @property {string} id
 * @property {string} name
 * @property {string} [email]
 * @property {string} [phone]
 * @property {"admin" | "staff" | "farmer"} role
 * @property {string | null} [farmerId]
 */

/**
 * @param {unknown} error
 * @returns {string}
 */
function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

export function createAuthState() {
  /** @type {{
   * user: AuthUser | null,
   * isLoading: boolean,
   * isInitialized: boolean,
   * error: string | null
   * }} */
  let state = $state({
    user: null,
    isLoading: true,
    isInitialized: false,
    error: null,
  });

  async function initialize() {
    if (state.isInitialized) return;

    state.isLoading = true;
    state.error = null;

    try {
      const response = await authService.getCurrentUser();
      state.user = response.user || null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        state.user = null;
      } else {
        state.error = getErrorMessage(error);
        state.user = null;
      }
    } finally {
      state.isLoading = false;
      state.isInitialized = true;
    }
  }

  /**
   * @param {string} email
   * @param {string} password
   */
  async function staffLogin(email, password) {
    state.error = null;

    try {
      const response = await authService.staffLogin(email, password);
      state.user = response.user || null;
      return response;
    } catch (error) {
      state.error = getErrorMessage(error);
      throw error;
    }
  }

  /**
   * @param {string} phone
   */
  async function requestFarmerOtp(phone) {
    state.error = null;

    try {
      return await authService.requestFarmerOtp(phone);
    } catch (error) {
      state.error = getErrorMessage(error);
      throw error;
    }
  }

  /**
   * @param {string} phone
   * @param {string} otp
   */
  async function verifyFarmerOtp(phone, otp) {
    state.error = null;

    try {
      const response = await authService.verifyFarmerOtp(phone, otp);
      state.user = response.user || null;
      return response;
    } catch (error) {
      state.error = getErrorMessage(error);
      throw error;
    }
  }

  async function logout() {
    state.error = null;

    try {
      await authService.logout();
    } finally {
      state.user = null;
    }
  }

  /**
   * @param {...string} roles
   */
  function hasRole(...roles) {
    return !!state.user && roles.includes(state.user.role);
  }

  return {
    get user() {
      return state.user;
    },

    get isAuthenticated() {
      return !!state.user;
    },

    get isLoading() {
      return state.isLoading;
    },

    get isInitialized() {
      return state.isInitialized;
    },

    get error() {
      return state.error;
    },

    initialize,
    staffLogin,
    requestFarmerOtp,
    verifyFarmerOtp,
    logout,
    hasRole,
  };
}

export function getAuthState() {
  const auth = getContext(AUTH_CONTEXT);

  if (!auth) {
    throw new Error(
      "Authentication context is unavailable. Ensure the component is inside the root layout."
    );
  }

  return auth;
}
