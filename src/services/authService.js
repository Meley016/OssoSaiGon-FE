import axiosClient from "../api/axiosClient";

export const authService = {
  register: (data) => axiosClient.post("/register", data),
  login: (data) => axiosClient.post("/login", data),
  logout: () => axiosClient.get("/logout"),
  me: () => axiosClient.get("/me"),
  forgotPassword: (email) => axiosClient.post("/forgot-password/send-otp", { email }),
  verifyForgotOtp: (email, otp, newPassword) =>
    axiosClient.post("/forgot-password/verify", { email, otp, newPassword }),
};
