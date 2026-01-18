import React, { useState } from "react";
import { ID } from "appwrite";
import { storage, databases } from "../appwrite/appwrite.config";
import {
  bucketId,
  databaseId,
  projectId,
  productCategoryId,
} from "../conf/conf";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function AddProductCategory() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const editCategory = location.state?.category || null;
  const isEditMode = Boolean(editCategory);
  const [oldImageId, setOldImageId] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: "",
    categoryDescription: "",
    isActive: true,
    categoryImg: null,
    categoryImgId: "",
  });

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        categoryName: editCategory.categoryName || "",
        categoryDescription: editCategory.categoryDescription || "",
        isActive: editCategory.isActive,
        categoryImg: editCategory.categoryImg || null,
        categoryImgId: editCategory.categoryImgId || "",
      });
      setOldImageId(editCategory.categoryImgId || null);
    }
  }, [isEditMode, editCategory]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * Upload image to Appwrite Storage
   */
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);

      //  Upload new image
      const uploadedFile = await storage.createFile({
        bucketId,
        fileId: ID.unique(),
        file,
      });

      const newImageUrl = storage.getFileView({
        bucketId,
        fileId: uploadedFile.$id,
      });

      // Delete old image ONLY if editing & exists
      if (isEditMode && oldImageId) {
        try {
          await storage.deleteFile({ bucketId: bucketId, fileId: oldImageId });
        } catch (err) {
          console.warn("Old image delete failed:", err);
        }
      }

      // Update state with new image
      setFormData((prev) => ({
        ...prev,
        categoryImg: newImageUrl,
        categoryImgId: uploadedFile.$id,
      }));

      // Update oldImageId to new one (important!)
      setOldImageId(uploadedFile.$id);
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Submit category data
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (isEditMode) {
        /* ========== UPDATE ========== */
        await databases.updateRow({
          databaseId,
          tableId: productCategoryId,
          rowId: editCategory.$id,
          data: {
            categoryName: formData.categoryName,
            categoryDescription: formData.categoryDescription,
            isActive: formData.isActive,
            categoryImg: formData.categoryImg,
            categoryImgId: formData.categoryImgId,
          },
        });

        alert("Category updated successfully");
      } else {
        /* ========== CREATE ========== */
        await databases.createRow({
          databaseId,
          tableId: productCategoryId,
          rowId: ID.unique(),
          data: {
            categoryName: formData.categoryName,
            categoryDescription: formData.categoryDescription,
            isActive: formData.isActive,
            categoryImg: formData.categoryImg,
            categoryImgId: formData.categoryImgId,
          },
        });

        alert("Category added successfully");
      }

      navigate("/prodcutCategory"); // go back to list
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>
        {isEditMode ? "Edit Product Category" : "Add Product Category"}
      </h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="categoryName"
          placeholder="Category Name"
          value={formData.categoryName}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <textarea
          name="categoryDescription"
          placeholder="Category Description"
          value={formData.categoryDescription}
          onChange={handleChange}
          style={styles.textarea}
        />

        <label style={styles.checkbox}>
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
          Active
        </label>

        {/* IMAGE PREVIEW */}
        {formData.categoryImg && (
          <img
            src={formData.categoryImg}
            alt="Preview"
            style={styles.preview}
          />
        )}

        <input type="file" accept="image/*" onChange={handleImageChange} />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading
            ? "Saving..."
            : isEditMode
              ? "Update Category"
              : "Save Category"}
        </button>
      </form>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  container: {
    maxWidth: "420px",
    margin: "30px auto",
    padding: "24px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  heading: {
    marginBottom: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  input: {
    padding: "10px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  textarea: {
    padding: "10px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  preview: {
    width: "80px",
    height: "80px",
    borderRadius: "8px",
    objectFit: "cover",
  },
  button: {
    padding: "12px",
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
