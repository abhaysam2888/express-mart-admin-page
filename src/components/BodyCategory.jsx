import React, { useState, useEffect, useMemo } from "react";
import { Query } from "appwrite";
import {
  databases,
  PRODUCT_CATEGORY_COLLECTION_ID,
  BODY_CATEGORY_ID,
  DATABASE_ID,
} from "../appwrite/appwrite.config";
import bodyCategoryService from "../appwrite/bodyCategory";

export default function BodyCategory() {
  const [productCategories, setProductCategories] = useState([]);
  const [bodyCategories, setBodyCategories] = useState([]);
  const [selectedBodyCategoryId, setSelectedBodyCategoryId] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Responsive State
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. Fetch Master Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, bodyRes] = await Promise.all([
          databases.listRows({
            databaseId: DATABASE_ID,
            tableId: PRODUCT_CATEGORY_COLLECTION_ID,
            queries: [Query.limit(1000)],
          }),
          bodyCategoryService.listBodyCategory({ limit: 2000 }),
        ]);
        setProductCategories(prodRes.rows || []);
        setBodyCategories(bodyRes.rows || []);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Load existing relationships
  useEffect(() => {
    if (selectedBodyCategoryId) {
      const activeBody = bodyCategories.find(
        (c) => c.$id === selectedBodyCategoryId,
      );
      if (activeBody && activeBody.productCategory) {
        const existingIds = activeBody.productCategory.map((p) =>
          typeof p === "object" ? p.$id : p,
        );
        setSelectedProductIds(existingIds);
      } else {
        setSelectedProductIds([]);
      }
    } else {
      setSelectedProductIds([]);
    }
  }, [selectedBodyCategoryId, bodyCategories]);

  const availableItems = useMemo(() => {
    return (productCategories || []).filter((cat) => {
      const isNotSelected = !selectedProductIds.includes(cat.$id);
      const nameMatch = (cat.categoryName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return isNotSelected && nameMatch;
    });
  }, [productCategories, selectedProductIds, searchTerm]);

  const selectedItems = useMemo(() => {
    return (productCategories || []).filter((cat) =>
      selectedProductIds.includes(cat.$id),
    );
  }, [productCategories, selectedProductIds]);

  const toggleSelection = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (!selectedBodyCategoryId)
      return alert("Please select a target Body Category first.");
    try {
      setSaving(true);
      const response = await databases.updateRow({
        databaseId: DATABASE_ID,
        tableId: BODY_CATEGORY_ID,
        rowId: selectedBodyCategoryId,
        data: { productCategory: selectedProductIds },
      });
      setBodyCategories((prev) =>
        prev.map((cat) =>
          cat.$id === selectedBodyCategoryId
            ? { ...cat, productCategory: response.productCategory }
            : cat,
        ),
      );
      alert("Changes saved successfully!");
    } catch (error) {
      alert(`Save failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={loadingStyle}>Processing...</div>;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* HEADER SECTION */}
        <div
          style={{
            ...headerSection,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Select Target Category</label>
            <select
              style={selectStyle}
              value={selectedBodyCategoryId}
              onChange={(e) => setSelectedBodyCategoryId(e.target.value)}
            >
              <option value="">-- Choose Body Category --</option>
              {bodyCategories?.map((cat) => (
                <option key={cat.$id} value={cat.$id}>
                  {cat.bodyCategoryName}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Search Sub-Categories</label>
            <input
              style={inputStyle}
              placeholder="Type to filter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {selectedBodyCategoryId && (
          <div style={statsBar}>
            <strong>Status:</strong> {selectedProductIds.length} categories
            linked.
          </div>
        )}

        {/* MAIN SELECTION GRID */}
        <div
          style={{
            ...gridStyle,
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          }}
        >
          {/* LEFT: Available */}
          <div style={panelStyle}>
            <h4 style={panelTitle}>Available Categories</h4>
            <div style={listContainer}>
              {availableItems.length === 0 && (
                <p style={emptyText}>No matches found</p>
              )}
              {availableItems.map((item) => (
                <div
                  key={item.$id}
                  style={itemStyle}
                  onClick={() => toggleSelection(item.$id)}
                >
                  {item.categoryName}{" "}
                  <span style={{ color: "#10b981" }}>+</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Included */}
          <div
            style={{
              ...panelStyle,
              borderLeft: isMobile ? "none" : "1px solid #e2e8f0",
              borderTop: isMobile ? "1px solid #e2e8f0" : "none",
              backgroundColor: "#fcfdfe",
            }}
          >
            <h4 style={panelTitle}>Included categories</h4>
            <div style={listContainer}>
              {selectedItems.length === 0 && (
                <p style={emptyText}>Nothing selected</p>
              )}
              {selectedItems.map((item) => (
                <div
                  key={item.$id}
                  style={{ ...itemStyle, border: "1px solid #10b981" }}
                  onClick={() => toggleSelection(item.$id)}
                >
                  {item.categoryName}{" "}
                  <span style={{ color: "#ef4444" }}>×</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={footerStyle}>
          <button
            onClick={handleSave}
            disabled={!selectedBodyCategoryId || saving}
            style={{
              ...saveButtonStyle,
              width: isMobile ? "100%" : "auto",
              opacity: !selectedBodyCategoryId || saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving Changes..." : "Update Body Category"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- UPDATED STYLES ---
const containerStyle = {
  padding: "15px", // Reduced for mobile
  backgroundColor: "#f1f5f9",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  width: "100%",
  maxWidth: "1000px",
  display: "flex",
  flexDirection: "column",
  maxHeight: "90vh", // Prevent card from going off screen
};

const headerSection = {
  padding: "20px",
  display: "flex",
  gap: "15px",
  borderBottom: "1px solid #e2e8f0",
};

const gridStyle = {
  display: "grid",
  flex: 1,
  overflow: "hidden", // Important for inner scrolling
};

const panelStyle = {
  display: "flex",
  flexDirection: "column",
  padding: "15px",
  minHeight: "250px", // Give mobile stacks some height
  maxHeight: "400px", // Limit height on mobile so you can see both lists
};

const listContainer = {
  overflowY: "auto",
  flex: 1,
  paddingRight: "5px",
};

const itemStyle = {
  padding: "10px",
  border: "1px solid #f1f5f9",
  borderRadius: "8px",
  marginBottom: "8px",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  fontSize: "14px",
  backgroundColor: "#fff",
};

const statsBar = {
  padding: "10px 20px",
  backgroundColor: "#eff6ff",
  fontSize: "12px",
};
const labelStyle = {
  fontSize: "11px",
  fontWeight: "700",
  color: "#64748b",
  marginBottom: "4px",
};
const selectStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
};
const inputStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
};
const panelTitle = {
  margin: "0 0 10px 0",
  fontSize: "14px",
  fontWeight: "600",
};
const footerStyle = {
  padding: "15px",
  borderTop: "1px solid #e2e8f0",
  textAlign: "right",
};
const saveButtonStyle = {
  backgroundColor: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "6px",
  fontWeight: "bold",
};
const loadingStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
};
const emptyText = {
  textAlign: "center",
  color: "#94a3b8",
  fontSize: "13px",
  marginTop: "20px",
};
