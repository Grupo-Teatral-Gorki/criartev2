import {
  collection,
  addDoc,
  doc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../config/firebaseconfig";

export interface HelpVideo {
  id?: string;
  title: string;
  description: string;
  videoUrl: string;
  storagePath: string;
  order: number;
  createdAt: Timestamp;
}

const COLLECTION = "helpVideos";

export const HelpVideoService = {
  async getAll(): Promise<HelpVideo[]> {
    const q = query(collection(db, COLLECTION), orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as HelpVideo[];
  },

  async upload(
    file: File,
    title: string,
    description: string,
    onProgress?: (progress: number) => void
  ): Promise<HelpVideo> {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `videos_ajuda/${timestamp}_${safeName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    const videoUrl = await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });

    // Get current count to set order
    const existing = await getDocs(collection(db, COLLECTION));
    const order = existing.size;

    const docData = {
      title,
      description,
      videoUrl,
      storagePath,
      order,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, COLLECTION), docData);
    return { id: docRef.id, ...docData };
  },

  async update(
    id: string,
    data: Partial<Pick<HelpVideo, "title" | "description" | "order">>
  ): Promise<void> {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, data);
  },

  async replaceVideo(
    id: string,
    oldStoragePath: string,
    newFile: File,
    onProgress?: (progress: number) => void
  ): Promise<{ videoUrl: string; storagePath: string }> {
    // Upload new file
    const timestamp = Date.now();
    const safeName = newFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const newStoragePath = `videos_ajuda/${timestamp}_${safeName}`;
    const storageRef = ref(storage, newStoragePath);

    const uploadTask = uploadBytesResumable(storageRef, newFile, {
      contentType: newFile.type,
    });

    const videoUrl = await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });

    // Update Firestore doc
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, { videoUrl, storagePath: newStoragePath });

    // Delete old file from storage
    try {
      const oldRef = ref(storage, oldStoragePath);
      await deleteObject(oldRef);
    } catch (error) {
      console.warn("Could not delete old video from storage:", error);
    }

    return { videoUrl, storagePath: newStoragePath };
  },

  async delete(id: string, storagePath: string): Promise<void> {
    // Delete from storage
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (error) {
      console.warn("Could not delete file from storage:", error);
    }
    // Delete from Firestore
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
