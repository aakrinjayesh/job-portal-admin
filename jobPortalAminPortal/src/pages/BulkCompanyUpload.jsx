// import { Card, Upload, Button, message } from "antd";
// import { UploadOutlined } from "@ant-design/icons";
// import { useState } from "react";
// import { uploadCompaniesApi } from "../api/api"; // ✅ use API

// export default function BulkCompanyUpload() {
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);

//   const handleUpload = async (file) => {
//     try {
//       setLoading(true);

//       const res = await uploadCompaniesApi(file); // ✅ API call

//       setResult(res);

//       message.success("Upload successful 🚀");
//     } catch (err) {
//       message.error(err?.response?.data?.message || "Upload failed");
//     } finally {
//       setLoading(false);
//     }

//     return false; // prevent auto upload
//   };

//   return (
//     <div style={{ maxWidth: 900, margin: "0 auto" }}>
//       <Card title="Upload Companies (JSON)">
//         {/* 🔹 Upload Button */}
//         <Upload
//           beforeUpload={handleUpload}
//           showUploadList={false}
//           accept=".json"
//         >
//           <Button icon={<UploadOutlined />} loading={loading}>
//             Upload JSON File
//           </Button>
//         </Upload>

//         {/* 🔹 RESULT */}
//         {result && (
//           <Card style={{ marginTop: 20 }}>
//             <p>
//               <b>Total:</b> {result.total}
//             </p>
//             <p>
//               <b>Created:</b> {result.created}
//             </p>
//             <p>
//               <b>Skipped:</b> {result.skipped}
//             </p>
//           </Card>
//         )}
//       </Card>
//     </div>
//   );
// }

import { Card, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import { uploadCompaniesApi } from "../api/api";

export default function BulkCompanyUpload() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async (file) => {
    try {
      // 🔥 validate file type
      const isJson = file.type === "application/json";
      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";

      if (!isJson && !isExcel) {
        message.error("Only JSON or Excel (.xlsx, .xls) files allowed");
        return false;
      }

      setLoading(true);

      const res = await uploadCompaniesApi(file);

      setResult(res);

      message.success("Upload successful 🚀");
    } catch (err) {
      message.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }

    return false; // prevent auto upload
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <Card title="Upload Companies (JSON / Excel)">
        {/* 🔹 Upload Button */}
        <Upload
          beforeUpload={handleUpload}
          showUploadList={false}
          accept=".json,.xlsx,.xls"
        >
          <Button icon={<UploadOutlined />} loading={loading}>
            Upload JSON / Excel File
          </Button>
        </Upload>

        {/* 🔹 Helper text */}
        <p style={{ marginTop: 10, color: "#888", fontSize: 13 }}>
          Supported formats: .json, .xlsx, .xls
        </p>

        {/* 🔹 RESULT */}
        {result && (
          <Card style={{ marginTop: 20 }}>
            <p>
              <b>Total:</b> {result.total}
            </p>
            <p>
              <b>Created:</b> {result.created}
            </p>
            <p>
              <b>Skipped:</b> {result.skipped}
            </p>
          </Card>
        )}
      </Card>
    </div>
  );
}
