import { useState } from "react";
import { useMutation } from "convex/react";
// @ts-ignore
import { api } from "../../convex/_generated/api";

export default function DataBackup() {
  const importLegacyData = useMutation(api.legacy?.importLegacyData || "legacy:importLegacyData");
  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImport = async (overwrite: boolean) => {
    if (!jsonText) return;
    try {
      setLoading(true);
      await importLegacyData({ data: jsonText, overwrite });
      alert(overwrite ? "覆盖导入成功！" : "追加导入成功！");
      setJsonText("");
    } catch (error: any) {
      alert("导入失败: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-title">数据迁移</div>
        <div className="page-sub">从旧版 JSON 文件导入数据到 Convex 数据库。</div>
      </div>
      <div style={{ maxWidth: "600px" }}>
        <div className="card">
          <div className="card-title">导入恢复</div>
          <p style={{ fontSize: "12.5px", color: "var(--text2)", marginBottom: "8px" }}>
            将之前在旧版（localStorage）导出的 JSON 内容粘贴到下方以迁移到云端。
          </p>
          <p style={{ fontSize: "11.5px", color: "var(--text3)", marginBottom: "10px" }}>
            提示：您可以通过追加导入随时补充新学生的学业数据包。如果课程名称一致，会自动绑定现有的课程。
          </p>
          <textarea
            rows={10}
            style={{
              width: "100%",
              padding: "7px",
              border: "1px solid var(--border)",
              borderRadius: "var(--rsm)",
              fontFamily: "'DM Mono', monospace",
              fontSize: "11.5px",
              background: "var(--surface)",
              color: "var(--text)",
              resize: "vertical",
              marginBottom: "10px",
            }}
            placeholder="粘贴 JSON 内容..."
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-primary btn-sm" onClick={() => handleImport(false)} disabled={loading}>
              {loading ? "导入中..." : "追加导入 (保留已有数据)"}
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => { if (confirm("确定要清空当前所有数据吗？")) handleImport(true); }} disabled={loading}>
              覆盖导入 (清空旧数据)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
