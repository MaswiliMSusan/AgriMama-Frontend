
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

/**
 * @typedef {Object} ApiRequestOptions
 * @property {string} [method]
 * @property {unknown} [body]
 * @property {Record<string, string>} [headers]
 */

/**
 * @extends {Error}
 */
export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   * @param {unknown} [data]
   */
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";

    /** @type {number} */
    this.status = status;

    /** @type {unknown} */
    this.data = data;
  }
}

/**
 * @param {string} endpoint
 * @param {ApiRequestOptions} [options]
 */
export async function apiRequest(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
  } = options;

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const requestHeaders = new Headers({
    Accept: "application/json",
    ...headers,
  });

  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  /** @type {RequestInit} */
  const requestOptions = {
    method,
    credentials: "include",
    headers: requestHeaders,
    ...(body !== undefined
      ? { body: JSON.stringify(body) }
      : {}),
  };

  /** @type {Response} */
  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${normalizedEndpoint}`,
      requestOptions
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Network connection failed.";

    throw new ApiError(
      "Unable to connect to AgriMama. Please check your connection.",
      0,
      message
    );
  }

  const responseText = await response.text();

  /** @type {any} */
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }
  }

  if (!response.ok) {
    throw new ApiError(
      data?.message ||
        data?.error ||
        "An unexpected error occurred.",
      response.status,
      data
    );
  }

  return data;
}

export const api = {
  /**
   * @param {string} endpoint
   * @param {ApiRequestOptions} [options]
   */
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "GET",
    }),

  /**
   * @param {string} endpoint
   * @param {unknown} body
   * @param {ApiRequestOptions} [options]
   */
  post: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "POST",
      body,
    }),

  /**
   * @param {string} endpoint
   * @param {unknown} body
   * @param {ApiRequestOptions} [options]
   */
  put: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "PUT",
      body,
    }),

  /**
   * @param {string} endpoint
   * @param {unknown} body
   * @param {ApiRequestOptions} [options]
   */
  patch: (endpoint, body, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "PATCH",
      body,
    }),

  /**
   * @param {string} endpoint
   * @param {ApiRequestOptions} [options]
   */
  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "DELETE",
    }),
};
