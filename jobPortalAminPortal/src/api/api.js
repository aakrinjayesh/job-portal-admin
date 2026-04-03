import axiosInstance from "./axiosInstance";

export async function adminLoginApi(payload) {
  try {
    let data = JSON.stringify(payload);
    const response = await axiosInstance.post("/login", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in Login:", error);
    throw error;
  }
}

// Add this to src/api/adminApi.js
export async function getAdminStatsApi() {
  try {
    const response = await axiosInstance.get("/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
}

// src/api/api.js — add this
export async function executeQueryApi(query) {
  try {
    const response = await axiosInstance.post("/query", { query });
    return response.data;
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  }
}

// Add to src/api/api.js
export const getOrganizationsApi = (params) =>
  axiosInstance.get("/organizations", { params });

export const getOrganizationByIdApi = (id) =>
  axiosInstance.get(`/organizations/${id}`);

export const deleteOrganizationApi = (id) =>
  axiosInstance.delete(`/organizations/${id}`);

// export const updateSubscriptionStatusApi = (id, status) =>
//   axiosInstance.patch(`/organizations/${id}/subscription`, { status });

export const removeMemberApi = (memberId) =>
  axiosInstance.delete(`/organizations/members/${memberId}`);

// ── Promo Code APIs ──────────────────────────────────────────
export const getPromosApi = () => axiosInstance.get("/promo/list");

export const createPromoApi = (payload) =>
  axiosInstance.post("/promo/create", payload);

export const togglePromoApi = (id) =>
  axiosInstance.patch(`/promo/${id}/toggle`);

// ── Create User ──────────────────────────────────────────────
export async function createUserApi(payload) {
  try {
    const response = await axiosInstance.post("/create/user", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
