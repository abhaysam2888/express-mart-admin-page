import React, { useEffect, useState } from "react";
import { databases, storage } from "../appwrite/appwrite.config";
import { Query } from "appwrite";
import { bucketId, databaseId, productCategoryId } from "../conf/conf";
import { useNavigate } from "react-router-dom";

export default function ProductCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= FETCH ================= */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await databases.listRows({
        databaseId,
        tableId: productCategoryId,
        queries: [Query.orderDesc("$createdAt")],
      });
      setCategories(res.rows);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= TOGGLE ACTIVE ================= */
  const toggleActive = async (category) => {
    try {
      setActionLoading(category.$id);

      await databases.updateRow({
        databaseId,
        tableId: productCategoryId,
        rowId: category.$id,
        data: {
          isActive: !category.isActive,
        },
      });

      setCategories((prev) =>
        prev.map((c) =>
          c.$id === category.$id ? { ...c, isActive: !c.isActive } : c,
        ),
      );
    } catch (err) {
      console.error("Toggle failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  /* ================= DELETE ================= */
  const deleteCategory = async (category) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      setActionLoading(category.$id);

      // Optional: delete image from storage
      if (category.categoryImgId) {
        await storage.deleteFile({
          bucketId: bucketId,
          fileId: category.categoryImgId,
        });
      }

      await databases.deleteRow({
        databaseId,
        tableId: productCategoryId,
        rowId: category.$id,
      });

      setCategories((prev) => prev.filter((c) => c.$id !== category.$id));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <p className="text-white text-center">Loading categories...</p>;
  }

  return (
    <div className="pc-container">
      {categories.length === 0 ? (
        <p>No categories found</p>
      ) : (
        <div className="pc-table-wrapper">
          <table className="pc-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((cat) => (
                <tr key={cat.$id}>
                  <td data-label="Image">
                    {cat.categoryImg ? (
                      <img
                        src={cat.categoryImg}
                        alt={cat.categoryName}
                        className="pc-image"
                      />
                    ) : (
                      "—"
                    )}
                  </td>

                  <td data-label="Name">{cat.categoryName}</td>

                  <td data-label="Description" className="pc-desc">
                    {cat.categoryDescription || "-"}
                  </td>

                  <td data-label="Status">
                    <button
                      className={`pc-status ${
                        cat.isActive ? "active" : "inactive"
                      }`}
                      disabled={actionLoading === cat.$id}
                      onClick={() => toggleActive(cat)}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>

                  <td data-label="Actions" className="pc-actions-cell">
                    <div className="pc-actions">
                      <button
                        className="edit"
                        onClick={() =>
                          navigate("/AddprodcutCategory", {
                            state: { category: cat },
                          })
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="delete"
                        disabled={actionLoading === cat.$id}
                        onClick={() => deleteCategory(cat)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= STYLES ================= */}
      <style>{`
        .pc-container {
          background: #fff;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }

        .pc-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .pc-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .pc-table th {
          text-align: left;
          font-size: 13px;
          color: #555;
          border-bottom: 1px solid #eee;
          padding: 10px;
        }

        .pc-table td {
          padding: 12px 10px;
          border-bottom: 1px solid #f1f1f1;
          font-size: 14px;
          vertical-align: middle;
        }

        .pc-table th:nth-child(1),
        .pc-table td:nth-child(1) {
          width: 80px;
        }

        .pc-table th:nth-child(4),
        .pc-table td:nth-child(4) {
          width: 120px;
          text-align: center;
        }

        .pc-table th:nth-child(5),
        .pc-table td:nth-child(5) {
          width: 160px;
          text-align: center;
        }

        .pc-image {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          object-fit: cover;
        }

        .pc-desc {
          max-width: 240px;
          color: #666;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .pc-status {
          min-width: 90px;
          height: 28px;
          border-radius: 999px;
          font-size: 12px;
          border: none;
          cursor: pointer;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .pc-status.active {
          background: #16a34a;
        }

        .pc-status.inactive {
          background: #dc2626;
        }

        .pc-actions-cell {
          vertical-align: middle;
        }

        .pc-actions {
          display: flex;
          gap: 8px;
        }

        .pc-actions button {
          min-width: 64px;
          height: 28px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .pc-actions .edit {
          background: #2563eb;
          color: #fff;
        }

        .pc-actions .delete {
          background: #ef4444;
          color: #fff;
        }

        /* ============== MOBILE ============== */
        @media (max-width: 768px) {
          .pc-table thead {
            display: none;
          }

          .pc-table tr {
            display: block;
            margin-bottom: 16px;
            border: 1px solid #eee;
            border-radius: 10px;
            padding: 12px;
            background: #fafafa;
          }

          .pc-table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: none;
            padding: 8px 0;
          }

          .pc-table td::before {
            content: attr(data-label);
            font-weight: 600;
            color: #444;
          }

          .pc-desc {
            max-width: 160px;
          }

          .pc-actions-cell {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
