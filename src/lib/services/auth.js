
import { api } from "./api.js";

export const authService = {
  /**
   * Staff and admin email/password login.
   * @param {string} email
   * @param {string} password
   */
  async staffLogin(email, password) {
    return api.post("/auth/staff/login", {
      email,
      password,
    });
  },

  /**
   * Request an OTP for farmer login.
   * @param {string} phone
   */
  async requestFarmerOtp(phone) {
    return api.post("/auth/farmer/request-otp", {
      phone,
    });
  },

  /**
   * Verify farmer OTP.
   * @param {string} phone
   * @param {string} otp
   */
  async verifyFarmerOtp(phone, otp) {
    return api.post("/auth/farmer/verify-otp", {
      phone,
      otp,
    });
  },

  async getCurrentUser() {
    return api.get("/auth/me");
  },

  async logout() {
    return api.post("/auth/logout", {});
  },
};
