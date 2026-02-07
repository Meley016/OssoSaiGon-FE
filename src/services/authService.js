import axiosClient from "../api/axiosClient";

export const authService = {
  register: async (data) => {
    const res = await axiosClient.post("/register", data);
    return res.data;
  },
  login: async (data) => {
    const res = await axiosClient.post("/login", data);
    return res.data;
  },
  logout: () => axiosClient.get("/logout"),
  me: () => axiosClient.get("/me"),
  forgotPassword: (email) =>
    axiosClient.post("/forgot-password/send-otp", { email }),
  verifyForgotOtp: (email, otp, newPassword) =>
    axiosClient.post("/forgot-password/verify", { email, otp, newPassword }),
};
