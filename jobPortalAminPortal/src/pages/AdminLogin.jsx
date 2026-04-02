// src/pages/admin/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLoginApi } from "../api/api";

import { Form, Input, Button, Card, Typography, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onFinish = async (values) => {
    setError("");
    setLoading(true);

    try {
      const res = await adminLoginApi(values);

      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminInfo", JSON.stringify(res.data.admin));

      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fa",
      }}
    >
      <Card
        style={{ width: 400, borderRadius: 12 }}
        bodyStyle={{ padding: "2rem" }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "2rem" }}>🛡️</div>
          <Title level={3} style={{ marginBottom: 0 }}>
            Admin Portal
          </Title>
          <Text type="secondary">Sign in to manage your platform</Text>
        </div>

        {/* Error */}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: "1rem" }}
          />
        )}

        {/* Form */}
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="admin@yourcompany.com"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ height: "40px", borderRadius: 6 }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminLogin;
