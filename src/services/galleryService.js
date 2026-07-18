import { sampleGallery } from "../data/sampleGallery";

const firebaseEnvReady = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
].every((key) => Boolean(import.meta.env[key]));

async function loadFirebase() {
  const [firestore, storageModule, firebaseClient] = await Promise.all([
    import("firebase/firestore"),
    import("firebase/storage"),
    import("../firebase"),
  ]);
  return { firestore, storageModule, firebaseClient };
}

function sortItems(items) {
  return [...items].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return String(b.year || "").localeCompare(String(a.year || ""));
  });
}

export async function fetchGalleryItems({ includePending = false } = {}) {
  if (!firebaseEnvReady) {
    return sortItems(sampleGallery);
  }

  const { firestore, firebaseClient } = await loadFirebase();
  if (!firebaseClient.firebaseReady || !firebaseClient.db) {
    return sortItems(sampleGallery);
  }

  const snapshot = await firestore.getDocs(
    firestore.query(
      firestore.collection(firebaseClient.db, "galleryItems"),
      firestore.orderBy("createdAt", "desc"),
    ),
  );
  const items = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
  return includePending ? items : sortItems(items.filter((item) => item.approved !== false));
}

export async function uploadMedia(file, folder = "gallery") {
  if (!firebaseEnvReady || !file) return "";
  const { storageModule, firebaseClient } = await loadFirebase();
  if (!firebaseClient.firebaseReady || !firebaseClient.storage) return "";
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const mediaRef = storageModule.ref(firebaseClient.storage, `${folder}/${safeName}`);
  const uploadTask = storageModule.uploadBytesResumable(mediaRef, file);

  await new Promise((resolve, reject) => {
    uploadTask.on("state_changed", undefined, reject, resolve);
  });

  return storageModule.getDownloadURL(uploadTask.snapshot.ref);
}

export async function createGalleryItem(data, file) {
  if (!firebaseEnvReady) {
    throw new Error("Firebase is not configured yet.");
  }
  const { firestore, firebaseClient } = await loadFirebase();
  if (!firebaseClient.firebaseReady || !firebaseClient.db) {
    throw new Error("Firebase is not configured yet.");
  }
  const imageUrl = file ? await uploadMedia(file, "gallery") : data.image || "";
  await firestore.addDoc(firestore.collection(firebaseClient.db, "galleryItems"), {
    ...data,
    image: imageUrl,
    approved: data.approved ?? true,
    createdAt: firestore.serverTimestamp(),
    updatedAt: firestore.serverTimestamp(),
  });
}

export async function updateGalleryItem(id, data, file) {
  if (!firebaseEnvReady) {
    throw new Error("Firebase is not configured yet.");
  }
  const { firestore, firebaseClient } = await loadFirebase();
  if (!firebaseClient.firebaseReady || !firebaseClient.db) {
    throw new Error("Firebase is not configured yet.");
  }
  const imageUrl = file ? await uploadMedia(file, "gallery") : data.image;
  await firestore.updateDoc(firestore.doc(firebaseClient.db, "galleryItems", id), {
    ...data,
    image: imageUrl,
    updatedAt: firestore.serverTimestamp(),
  });
}

export async function deleteGalleryItem(id) {
  if (!firebaseEnvReady) {
    throw new Error("Firebase is not configured yet.");
  }
  const { firestore, firebaseClient } = await loadFirebase();
  if (!firebaseClient.firebaseReady || !firebaseClient.db) {
    throw new Error("Firebase is not configured yet.");
  }
  await firestore.deleteDoc(firestore.doc(firebaseClient.db, "galleryItems", id));
}

export async function createSubmission(data, file) {
  if (!firebaseEnvReady) {
    const pending = JSON.parse(localStorage.getItem("kapoorpurLocalSubmissions") || "[]");
    pending.unshift({ ...data, id: `local-${Date.now()}`, approved: false });
    localStorage.setItem("kapoorpurLocalSubmissions", JSON.stringify(pending.slice(0, 20)));
    return { local: true };
  }

  const { firestore, firebaseClient } = await loadFirebase();
  if (!firebaseClient.firebaseReady || !firebaseClient.db) {
    throw new Error("Firebase is not configured yet.");
  }
  const imageUrl = file ? await uploadMedia(file, "submissions") : "";
  await firestore.addDoc(firestore.collection(firebaseClient.db, "submissions"), {
    ...data,
    image: imageUrl,
    approved: false,
    status: "pending",
    createdAt: firestore.serverTimestamp(),
  });
  return { local: false };
}
