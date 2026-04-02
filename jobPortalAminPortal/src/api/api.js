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
