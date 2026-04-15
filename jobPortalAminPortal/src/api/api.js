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

// 🔍 Lookup user by email
export const lookupUserApi = async (email) => {
  try {
    const response = await axiosInstance.get("/users/lookup", {
      params: { email },
    });
    return response.data;
  } catch (error) {
    console.error("Lookup error:", error);
    throw error;
  }
};

// ❌ Delete user
export const deleteUserApi = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Delete error:", error);
    throw error;
  }
};

export const generateQueryApi = async (prompt) => {
  const res = await axios.post("/admin/generate-query", { prompt });
  return res.data; // { status, query }
};

// ── Plan Limits ──────────────────────────────────────────────
export const getPlanLimitsApi = () => axiosInstance.get("/plan-limits");

export const upsertPlanLimitApi = (payload) =>
  axiosInstance.post("/plan-limits", payload);

export const bulkUpsertPlanLimitsApi = (planId, limits) =>
  axiosInstance.post("/plan-limits/bulk", { planId, limits });

export const deletePlanLimitApi = (id) =>
  axiosInstance.delete(`/plan-limits/${id}`);

export const updatePlanPricingApi = (planId, data) =>
  axiosInstance.patch(`/plans/${planId}/pricing`, data);

// ✅ Create Company
export const createCompanyApi = async (payload) => {
  try {
    const response = await axiosInstance.post(
      "/companies/create", // matches backend route
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Create Company Error:", error);
    throw error;
  }
};

// 🔥 Bulk Upload Companies JSON
export const uploadCompaniesApi = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
      "/companies/upload-json",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
