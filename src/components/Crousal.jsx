import { useEffect, useState } from "react";
import { Storage, ID, TablesDB, Client } from "appwrite";
import {
  bucketId,
  crousalId,
  databaseId,
  endpoint,
  projectId,
} from "../conf/conf";

const client = new Client().setEndpoint(endpoint).setProject(projectId);
const storage = new Storage(client);
const databases = new TablesDB(client);

export default function Carousel() {
  const [images, setImages] = useState([]);
  const [rows, setRows] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Fetch images
  const fetchImages = async () => {
    const res = await databases.listRows({
      databaseId,
      tableId: crousalId,
    });

    const parsed = res.rows.flatMap((row) => {
      try {
        const imgs = JSON.parse(row.image || "[]");
        return imgs.map((url) => ({
          url,
          rowId: row.$id,
          imageId: row.imageId,
        }));
      } catch {
        return [];
      }
    });

    setImages(parsed);
    setActiveIndex(0);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Auto-slide
  useEffect(() => {
    if (!images.length) return;
    const timer = setInterval(
      () => setActiveIndex((i) => (i + 1) % images.length),
      4000
    );
    return () => clearInterval(timer);
  }, [images]);

  // Upload image
  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);

    try {
      const uploaded = await storage.createFile({
        bucketId,
        fileId: ID.unique(),
        file,
      });

      const imageUrl = storage.getFileView({
        bucketId,
        fileId: uploaded.$id,
      });

      // 2️⃣ Save BOTH imageId + image
      await databases.createRow({
        databaseId,
        tableId: crousalId,
        rowId: ID.unique(),
        data: {
          imageId: uploaded.$id,
          image: JSON.stringify([imageUrl]),
        },
      });
      await fetchImages();
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // 🔥 DELETE IMAGE
  const handleDelete = async (img) => {
    if (!confirm("Delete this carousel image?")) return;

    try {
      // delete db row
      await databases.deleteRow({
        databaseId,
        tableId: crousalId,
        rowId: img.rowId,
      });

      // delete storage file
      const fileId = img.url.split("/files/")[1]?.split("/")[0];
      if (fileId) {
        await storage.deleteFile({
          bucketId,
          fileId,
        });
      }

      fetchImages();
    } catch {
      alert("Delete failed");
    }
  };

  if (!images.length) {
    return (
      <div className="max-w-5xl mx-auto px-4">
        <UploadButton uploading={uploading} onUpload={handleUpload} />
        <div className="aspect-[16/9] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
          No carousel images
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <UploadButton uploading={uploading} onUpload={handleUpload} />

      {/* Carousel */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl shadow-lg">
        <img
          src={images[activeIndex].url}
          alt="carousel"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        />

        {/* Controls */}
        <button
          onClick={() =>
            setActiveIndex(
              activeIndex === 0 ? images.length - 1 : activeIndex - 1
            )
          }
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full"
        >
          ‹
        </button>

        <button
          onClick={() => setActiveIndex((activeIndex + 1) % images.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full"
        >
          ›
        </button>

        {/* Delete */}
        <button
          onClick={() => handleDelete(images[activeIndex])}
          className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded text-xs"
        >
          Delete
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 w-full flex justify-center gap-2">
          {images.map((_, i) => (
            <span
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 w-2 rounded-full cursor-pointer ${
                i === activeIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* 🔹 Upload Button */
function UploadButton({ uploading, onUpload }) {
  return (
    <label className="block mb-4">
      <input
        type="file"
        hidden
        accept="image/*"
        onChange={(e) => onUpload(e.target.files[0])}
      />
      <div className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded text-center">
        {uploading ? "Uploading..." : "+ Add Carousel Image"}
      </div>
    </label>
  );
}
