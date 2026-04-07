// src/pages/AdminCreateUser.jsx
import { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Typography,
  Alert,
  Space,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { createUserApi } from "../api/api";

const { Title, Text } = Typography;
const { Option } = Select;

export default function AdminCreateUser() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { type: "success"|"error", message: string }

  const onFinish = async (values) => {
    setLoading(true);
    setResult(null);
    try {
      const data = await createUserApi(values);
      setResult({ type: "success", message: data.message || "User created successfully." });
      form.resetFields();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      setResult({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "calc(100vh - 80px)",
        padding: "40px 16px",
        background: "#f5f6fa",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 12,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
        bodyStyle={{ padding: "36px 40px" }}
      >
        {/* Header */}
        <Space direction="vertical" size={4} style={{ marginBottom: 28 }}>
          <Title level={3} style={{ margin: 0, color: "#011026" }}>
            Create User
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Admin-created accounts skip OTP verification
          </Text>
        </Space>

        {/* Result banner */}
        {result && (
          <Alert
            type={result.type}
            message={result.message}
            showIcon
            closable
            onClose={() => setResult(null)}
            icon={result.type === "success" ? <CheckCircleOutlined /> : undefined}
            style={{ marginBottom: 24, borderRadius: 8 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          size="large"
        >
          {/* Name */}
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: "Please enter the full name" }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#bbb" }} />}
              placeholder="John Doe"
              autoComplete="off"
            />
          </Form.Item>

          {/* Email */}
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Please enter an email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: "#bbb" }} />}
              placeholder="john@company.com"
              autoComplete="off"
            />
          </Form.Item>

          {/* Role */}
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select
              placeholder="Select role"
              suffixIcon={<TeamOutlined style={{ color: "#bbb" }} />}
            >
              <Option value="candidate">Candidate</Option>
              <Option value="company">Company</Option>
              {/* <Option value="admin">Admin</Option> */}
            </Select>
          </Form.Item>

          {/* Password */}
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please enter a password" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#bbb" }} />}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
            />
          </Form.Item>

          {/* Submit */}
          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 46,
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
                background: "#1677FF",
              }}
            >
              {loading ? "Creating User..." : "Create User"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
