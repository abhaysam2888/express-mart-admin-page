import React, { useState, useEffect, useCallback } from "react";
import { ID, Query } from "appwrite";
import {
  databases,
  DATABASE_ID,
  HEADER_CATEGORY_ID,
  PRODUCT_CATEGORY_COLLECTION_ID,
} from "../appwrite/appwrite.config";
import headerCategoryService from "../appwrite/headerCategory";

export default function HeaderCategory() {
  const [headerName, setHeaderName] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productCategories, setProductCategories] = useState([]);
  const [existingHeaders, setExistingHeaders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // 1. Stable Fetch Function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [categoriesRes, headersRes] = await Promise.all([
        databases.listRows({
          databaseId: DATABASE_ID,
          tableId: PRODUCT_CATEGORY_COLLECTION_ID,
          total: false,
          queries: [Query.limit(10000)],
        }),
        headerCategoryService.listHeaderCategory({ limit: 1000 }),
      ]);

      // 1. Get a list of IDs that are already in the headers
      const existingCategoryIds = (headersRes.rows || []).map(
        (header) => header.productCategory?.$id,
      );

      // 2. Filter the master product categories list
      const filteredCategories = (categoriesRes.rows || []).filter(
        (category) => !existingCategoryIds.includes(category.$id),
      );

      // 3. Update your state
      setProductCategories(filteredCategories);
      setExistingHeaders(headersRes.rows || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Helper to find Category Name from ID
  // const getCategoryName = (id) => {
  //   const category = productCategories.find((cat) => cat.$id === id);
  //   return category ? category.categoryName : "Unknown Category";
  // };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setIsCreating(true);
      const a = await databases.createRow({
        databaseId: DATABASE_ID,
        tableId: HEADER_CATEGORY_ID,
        rowId: ID.unique(),
        data: {
          productCategory: selectedProductId,
          isActive: true,
        },
      });

      setHeaderName("");
      setSelectedProductId("");
      setSearch("");
      fetchData();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredProducts = productCategories.filter((p) =>
    p.categoryName?.toLowerCase().includes(search.toLowerCase()),
  );

  // toogle status

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await databases.updateRow({
        databaseId: DATABASE_ID,
        tableId: HEADER_CATEGORY_ID,
        rowId: id,
        data: { isActive: !currentStatus },
      });
      fetchData(); // Refresh list
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  // delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this header?")) return;
    try {
      await databases.deleteRow({
        databaseId: DATABASE_ID,
        tableId: HEADER_CATEGORY_ID,
        rowId: id,
      });
      fetchData(); // Refresh list
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div style={container}>
      {/* LEFT: LISTING */}
      <div style={listCard}>
        <div style={headerBox}>
          <h2 style={{ margin: 0, fontSize: "18px" }}>Header Categories</h2>
        </div>
        <div style={scrollList}>
          {existingHeaders.map((item) => (
            <div key={item.$id} style={listItem} className="flex-wrap">
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {item?.productCategory?.categoryName || "No Name"}
                  <span
                    style={{
                      fontSize: "10px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: item.isActive ? "#dcfce7" : "#fee2e2",
                      color: item.isActive ? "#166534" : "#991b1b",
                    }}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  ID: {item.$id.slice(0, 8)}...
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }} className="my-2">
                <button
                  onClick={() => handleToggleStatus(item.$id, item.isActive)}
                  style={{
                    ...actionBtn,
                    backgroundColor: item.isActive ? "#f1f5f9" : "#6366f1",
                    color: item.isActive ? "#1e293b" : "#fff",
                  }}
                >
                  {item.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDelete(item.$id)}
                  style={{
                    ...actionBtn,
                    backgroundColor: "#fee2e2",
                    color: "#ef4444",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: CREATE FORM */}
      <div style={formCard}>
        <div style={headerBox}>
          <h2 style={{ margin: 0, fontSize: "18px" }}>Add New</h2>
        </div>
        <form onSubmit={handleCreate} style={formStyle}>
          <div style={field}>
            <label style={labelStyle}>Search Category</label>
            <input
              style={{ ...inputStyle, marginBottom: "8px" }}
              placeholder="Filter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div style={selectionBox}>
              {filteredProducts.map((cat) => (
                <div
                  key={cat.$id}
                  onClick={() => setSelectedProductId(cat.$id)}
                  style={{
                    ...selectionItem,
                    backgroundColor:
                      selectedProductId === cat.$id ? "#2563eb" : "transparent",
                    color: selectedProductId === cat.$id ? "#fff" : "#1e293b",
                  }}
                >
                  {cat.categoryName}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" style={submitBtn} disabled={isCreating}>
            {isCreating ? "Saving..." : "Create Header"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* --- STYLES --- */

const container = {
  display: "flex",
  padding: "30px",
  gap: "20px",
  background: "#f1f5f9",
  minHeight: "100vh",
  flexWrap: "wrap",
  justifyContent: "center",
};

const actionBtn = {
  padding: "6px 10px",
  fontSize: "12px",
  fontWeight: "600",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  transition: "0.2s",
};
const listCard = {
  flex: "1",
  minWidth: "350px",
  maxWidth: "500px",
  background: "#fff",
  borderRadius: "10px",
  height: "fit-content",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
};
const formCard = {
  width: "350px",
  background: "#fff",
  borderRadius: "10px",
  height: "fit-content",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
};
const headerBox = { padding: "15px 20px", borderBottom: "1px solid #eee" };
const formStyle = {
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};
const field = { display: "flex", flexDirection: "column" };
const labelStyle = {
  fontSize: "11px",
  fontWeight: "700",
  color: "#64748b",
  marginBottom: "5px",
  textTransform: "uppercase",
};
const inputStyle = {
  padding: "10px",
  borderRadius: "5px",
  border: "1px solid #ddd",
  outline: "none",
};
const selectionBox = {
  height: "200px",
  overflowY: "auto",
  border: "1px solid #eee",
  borderRadius: "5px",
};
const selectionItem = {
  padding: "10px",
  cursor: "pointer",
  fontSize: "14px",
  borderBottom: "1px solid #f9f9f9",
};
const scrollList = { padding: "15px", maxHeight: "500px", overflowY: "auto" };
const listItem = {
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "10px",
  border: "1px solid #f1f5f9",
  background: "#f8fafc",
  // display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
const submitBtn = {
  background: "#000",
  color: "#fff",
  border: "none",
  padding: "12px",
  borderRadius: "5px",
  fontWeight: "600",
  cursor: "pointer",
};
