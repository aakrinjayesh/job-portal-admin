import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  InputNumber,
  Divider,
  Upload,
  message,
  App,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  createCompanyApi,
  getCompaniesApi,
  getCompanyByIdApi,
  updateCompanyApi,
  uploadLogoApi,
} from "../api/api";

const { Option } = Select;
const { TextArea } = Input;

/* 🔥 TAG INPUT (EXACT UI LIKE YOUR SCREENSHOT) */
const TagInput = ({ value = [], onChange, placeholder, helper }) => {
  const [inputVal, setInputVal] = useState("");

  const addTag = () => {
    const v = inputVal.trim();
    if (v && !value.includes(v)) {
      onChange([...value, v]);
    }
    setInputVal("");
  };

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div>
      {/* TAGS */}
      {value.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 10,
          }}
        >
          {value.map((tag) => (
            <span
              key={tag}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                background: "#e6f4ff",
                border: "1px solid #91caff",
                borderRadius: 6,
                fontSize: 13,
                color: "#1677ff",
              }}
            >
              {tag}
              <span
                onClick={() => removeTag(tag)}
                style={{
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#666",
                }}
              >
                ✕
              </span>
            </span>
          ))}
        </div>
      )}

      {/* INPUT + BUTTON */}
      <div style={{ display: "flex", gap: 8 }}>
        <Input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onPressEnter={(e) => {
            e.preventDefault();
            addTag();
          }}
          placeholder={placeholder}
        />

        <Button onClick={addTag}>+ Add</Button>
      </div>

      {/* HELPER TEXT */}
      {helper && (
        <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
          {helper}
        </div>
      )}
    </div>
  );
};

export default function AddCompany() {
  const [form] = Form.useForm();

  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [clouds, setClouds] = useState([]);
  // const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const { message } = App.useApp();

  //   const [partnerTier, setPartnerTier] = useState("");
  //   const [partnerType, setPartnerType] = useState("");

  useEffect(() => {
    if (editMode) {
      loadCompanies();
    }
  }, [editMode]);

  const loadCompanies = async () => {
    try {
      const res = await getCompaniesApi();

      setCompanies(res.data);
    } catch (err) {
      message.error("Failed to load companies");
    }
  };

  const handleCompanyChange = async (organizationId) => {
    // ✅ User clicked Clear
    if (!organizationId) {
      setSelectedCompanyId(null);

      form.resetFields();

      setLocations([]);
      setSpecialties([]);
      setClouds([]);

      setLogoUrl("");
      setCoverImageUrl("");

      return;
    }
    try {
      setSelectedCompanyId(organizationId);

      const res = await getCompanyByIdApi(organizationId);

      const { org, company } = res.data;

      form.setFieldsValue({
        organizationName: org.name,
        domain: org.domain,

        companyName: company.name,
        slug: company.slug,
        tagline: company.tagline,
        description: company.description,
        website: company.website,
        headquarters: company.headquarters,
        companySize: company.companySize,
        foundedYear: company.foundedYear,

        partnerTier: company.partnerTier,
        partnerType: company.partnerType,

        linkedin: company.socialLinks?.linkedin,
        twitter: company.socialLinks?.twitter,
        instagram: company.socialLinks?.instagram,
      });

      setLocations(company.locations || []);
      setSpecialties(company.specialties || []);
      setClouds(company.clouds || []);
      setLogoUrl(company.logoUrl || "");
      setCoverImageUrl(company.coverImage || "");
    } catch (err) {
      message.error("Failed to load company");
    }
  };
  const handleUpload = async (file, type) => {
    try {
      if (type === "logo") {
        setUploadingLogo(true);
      } else {
        setUploadingCover(true);
      }

      const res = await uploadLogoApi(file);

      if (res?.url) {
        if (type === "logo") {
          setLogoUrl(res.url);
        } else {
          setCoverImageUrl(res.url);
        }

        message.success("Uploaded successfully");
      } else {
        message.error("Upload failed");
      }
    } catch {
      message.error("Upload failed");
    } finally {
      setUploadingLogo(false);
      setUploadingCover(false);
    }

    return false;
  };

  const resetForm = () => {
    form.resetFields();

    setLocations([]);
    setSpecialties([]);
    setClouds([]);

    setLogoUrl("");
    setCoverImageUrl("");

    setSelectedCompanyId(null);
  };
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const payload = {
        name: values.organizationName,
        domain: values.domain,
        profile: {
          name: values.companyName,
          slug: values.slug,
          tagline: values.tagline,
          description: values.description,
          website: values.website,
          industry: values.industry,
          logoUrl,
          coverImage: coverImageUrl,
          companySize: values.companySize,
          foundedYear: values.foundedYear,
          headquarters: values.headquarters,
          locations,
          specialties,
          clouds,
          // certifications,
          partnerTier: values.partnerTier,
          partnerType: values.partnerType,
          socialLinks: {
            linkedin: values.linkedin,
            twitter: values.twitter,
            instagram: values.instagram,
          },
        },
      };

      if (editMode) {
        await updateCompanyApi(selectedCompanyId, payload);

        message.success({
          content: "Company Profile updated successfully 🚀",
          duration: 3,
        });
      } else {
        await createCompanyApi(payload);

        message.success({
          content: "Company Profile created successfully 🚀",
          duration: 3,
        });
      }

      resetForm();
      setEditMode(false);
    } catch (err) {
      // ✅ Ant Design throws { errorFields } when validation fails
      if (err?.errorFields) {
        message.warning(
          "Please fill in all required fields before submitting.",
        );
        return;
      }
      message.error(err?.response?.data?.message || "Error creating company");
    } finally {
      setLoading(false); // ✅ ADD THIS BLOCK
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 20,
        }}
      >
        <Button
          onClick={() => {
            if (editMode) {
              resetForm();
              setEditMode(false);
            } else {
              setEditMode(true);
            }
          }}
        >
          {editMode ? "Cancel Edit" : "Edit Company"}
        </Button>
      </div>
      <Form form={form} layout="vertical">
        {/* 🔹 ORGANIZATION */}
        <Card title="Organization Details" style={{ marginBottom: 20 }}>
          {editMode && (
            <Form.Item label="Select Organization" style={{ marginBottom: 20 }}>
              <Select
                showSearch
                allowClear
                placeholder="Search Organization"
                value={selectedCompanyId}
                onChange={handleCompanyChange}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {companies.map((company) => (
                  <Option key={company.id} value={company.id}>
                    {company.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Form.Item
            name="organizationName"
            label="Organization Name"
            rules={[
              { required: true },
              { max: 50, message: "Max 50 characters allowed" },
            ]}
          >
            <Input placeholder="Google" maxLength={50} showCount />
          </Form.Item>

          <Form.Item
            name="domain"
            label="Domain"
            rules={[
              { required: true },
              { max: 30, message: "Max 30 characters allowed" },
            ]}
          >
            <Input placeholder="google.com" maxLength={30} showCount />
          </Form.Item>
        </Card>

        <Card title="Brand Assets" style={{ marginBottom: 20 }}>
          <Form.Item
            label="Cover Image"
            extra="Recommended size: 1128 × 191 px"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {coverImageUrl && (
                <img
                  src={coverImageUrl}
                  alt="cover"
                  style={{
                    width: 220,
                    height: 70,
                    objectFit: "cover",
                    borderRadius: 6,
                    border: "1px solid #d9d9d9",
                  }}
                />
              )}

              <Upload
                beforeUpload={(file) => handleUpload(file, "cover")}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} loading={uploadingCover}>
                  {coverImageUrl ? "Change Cover" : "Upload Cover"}
                </Button>
              </Upload>
            </div>
          </Form.Item>

          <Divider />

          <Form.Item label="Company Logo" extra="Square PNG/JPG">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="logo"
                  style={{
                    width: 70,
                    height: 70,
                    objectFit: "contain",
                    border: "1px solid #d9d9d9",
                    borderRadius: 6,
                  }}
                />
              )}

              <Upload
                beforeUpload={(file) => handleUpload(file, "logo")}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} loading={uploadingLogo}>
                  {logoUrl ? "Change Logo" : "Upload Logo"}
                </Button>
              </Upload>
            </div>
          </Form.Item>
        </Card>

        {/* 🔹 OVERVIEW */}
        <Card title="Company Overview" style={{ marginBottom: 20 }}>
          <Form.Item
            name="companyName"
            label="Company Name"
            rules={[
              { required: true, message: "Please enter company name" },
              { max: 50, message: "Max 50 characters allowed" },
            ]}
          >
            <Input maxLength={50} showCount />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[
              { required: true, message: "Please enter a website URL" },
              { max: 50, message: "Max 50 characters allowed" },
              {
                pattern: /^[a-z0-9-]+$/,
                message: "Only lowercase letters, numbers and hyphens allowed",
              },
            ]}
          >
            <Input maxLength={50} />
          </Form.Item>

          <Form.Item
            name="tagline"
            label="Tagline"
            rules={[{ max: 120, message: "Max 120 characters allowed" }]}
          >
            <Input maxLength={120} showCount />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ max: 2000, message: "Max 2000 characters allowed" }]}
          >
            <TextArea rows={4} maxLength={2000} showCount />
          </Form.Item>

          <Form.Item
            name="website"
            label="Website"
            rules={[
              { required: true, message: "Please enter a website URL" },
              {
                // pattern: /^https:\/\/(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}.*$/,
                pattern:
                  /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}.*$/,
                message: "Please enter a valid https website URL",
              },
              { max: 200, message: "Max 200 characters allowed" },
            ]}
          >
            <Input placeholder="https://example.com" maxLength={200} />
          </Form.Item>

          <Form.Item
            name="headquarters"
            label="Headquarters"
            rules={[{ max: 120, message: "Max 120 characters allowed" }]}
          >
            <Input maxLength={120} />
          </Form.Item>

          <Form.Item
            name="companySize"
            label="Company Size"
            rules={[
              { required: true, message: "Please select a company size" },
            ]}
          >
            <Select>
              <Option value="1-10">1-10</Option>
              <Option value="11-50">11-50</Option>
              <Option value="51-200">51-200</Option>
              <Option value="200+">200+</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="foundedYear"
            label="Founded Year"
            rules={[
              //   { required: true, message: "Please enter founded year" },
              {
                type: "number",
                min: 1900,
                max: new Date().getFullYear(),
                message: "Enter a valid year",
              },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Card>

        {/* 🔹 TAG SECTIONS */}
        <Card title="Locations & Specialties" style={{ marginBottom: 20 }}>
          <Form.Item
            label="Office Locations"
            extra="Add all countries / regions your company operates in"
          >
            <TagInput
              value={locations}
              onChange={setLocations}
              placeholder="e.g. India, USA"
            />
          </Form.Item>

          <Divider />

          <Form.Item
            label="Specialties"
            extra="Key skills and focus areas of your company"
          >
            <TagInput
              value={specialties}
              onChange={setSpecialties}
              placeholder="e.g. Salesforce, AI Hiring"
            />
          </Form.Item>

          <Divider />

          <Form.Item label="Clouds">
            <TagInput
              value={clouds}
              onChange={setClouds}
              placeholder="e.g. Sales Cloud"
            />
          </Form.Item>

          {/* <Divider />

          <Form.Item label="Certifications">
            <TagInput
              value={certifications}
              onChange={setCertifications}
              placeholder="e.g. Salesforce Admin"
            />
          </Form.Item> */}
        </Card>

        {/* 🔹 PARTNER */}
        <Card title="Partner Details" style={{ marginBottom: 20 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="partnerTier" label="Partner Tier">
                <Select placeholder="Select tier">
                  <Option value="Base Partner">Base Partner</Option>
                  <Option value="Ridge Partner">Ridge Partner</Option>
                  <Option value="Crest Partner">Crest Partner</Option>
                  <Option value="Summit Partner">Summit Partner</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="partnerType" label="Partner Type">
                <Select placeholder="Select type">
                  <Option value="Consulting Partner">Consulting Partner</Option>
                  <Option value="Implementation Partner">
                    Implementation Partner
                  </Option>
                  <Option value="System Integrator">
                    System Integrator Partner
                  </Option>
                  <Option value="Managed Services Provider">
                    Managed Services Provider Partner
                  </Option>
                  <Option value="ISV (Product Partner)">
                    ISV (Product Partner)
                  </Option>
                  <Option value="Reseller Partner">Reseller Partner</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 🔹 SOCIAL */}

        <Card title="Social Links" style={{ marginBottom: 20 }}>
          <Row gutter={16}>
            {/* 🔹 LinkedIn */}
            <Col span={8}>
              <Form.Item
                label="LinkedIn"
                name="linkedin"
                rules={[
                  {
                    pattern: /^https:\/\/(www\.)?linkedin\.com\/.+$/,
                    message: "Please enter valid LinkedIn link",
                  },
                ]}
              >
                <Input placeholder="https://linkedin.com/company/…" />
              </Form.Item>
            </Col>

            {/* 🔹 Twitter / X */}
            <Col span={8}>
              <Form.Item
                label="Twitter / X"
                name="twitter"
                rules={[
                  {
                    pattern: /^https:\/\/(www\.)?(twitter\.com|x\.com)\/.+$/,
                    message: "Please enter valid Twitter link",
                  },
                ]}
              >
                <Input placeholder="https://twitter.com/…" />
              </Form.Item>
            </Col>

            {/* 🔹 Instagram */}
            <Col span={8}>
              <Form.Item
                label="Instagram"
                name="instagram"
                rules={[
                  {
                    pattern: /^https:\/\/(www\.)?instagram\.com\/.+$/,
                    message: "Please enter valid Instagram link",
                  },
                ]}
              >
                <Input placeholder="https://instagram.com/…" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 🔹 SUBMIT */}
        <div style={{ textAlign: "right" }}>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
          >
            {editMode ? "Update Company" : "Create Company"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
