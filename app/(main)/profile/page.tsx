"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

import ProfileImageUpload from "@/app/components/ProfileImageUpload";
import Spinner from "@/app/components/Spinner"; // ✅ Import Spinner
import { useAuth } from "@/app/context/AuthContext";
import { findCityLabel } from "@/app/utils/validators";

// Firebase imports
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { storage, db } from "@/app/config/firebaseconfig"; // adjust path if your firebase config is elsewhere

const Profile: React.FC = () => {
  const { dbUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [profileImage, setProfileImage] = useState<string>("");

  useEffect(() => {
    if (dbUser?.photoUrl) {
      setProfileImage(dbUser.photoUrl); // Set the profile image if it exists in dbUser
    } else {
      setProfileImage("https://robohash.org/placeholder.png"); // Set placeholder if no image
    }
  }, [dbUser]); // Run this when dbUser changes

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleImageUpload = async (newImageFile: File) => {
    setUploading(true);

    if (!dbUser?.cityId || !dbUser?.id) {
      console.error("Missing user cityId or id.");
      return;
    }

    try {
      const path = `profile-images/${dbUser.cityId}/${dbUser.id}/${uuidv4()}`;
      const imageRef = ref(storage, path);

      await uploadBytes(imageRef, newImageFile);
      const downloadURL = await getDownloadURL(imageRef);
      setProfileImage(downloadURL);

      const userDocRef = doc(db, "users", dbUser.id);
      await updateDoc(userDocRef, {
        photoUrl: downloadURL,
      });
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-center my-10 flex-col gap-4">
        <div className=" bg-primary dark:bg-slate-300 flex flex-col items-center justify-center p-8 gap-4 rounded-2xl shadow-xl relative">
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 rounded-2xl z-10">
              <Spinner />
            </div>
          )}

          <div
            className="w-40 h-40 rounded-full bg-primary dark:bg-navy flex items-center justify-center overflow-hidden shadow-lg cursor-pointer"
            onClick={handleImageClick}
          >
            <Image
              src={profileImage}
              alt="profile"
              width={250}
              height={250}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-4 text-center  text-white dark:text-navy text-2xl">
            <p>Usuário: {dbUser?.firstName}</p>
            <p>Cidade: {findCityLabel(dbUser?.cityId ?? "")}</p>
            <p>Tipo de Usuário: {dbUser?.userRole}</p>
          </div>
        </div>
      </div>

      <ProfileImageUpload
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onImageUpload={handleImageUpload}
      />
    </>
  );
};

export default Profile;
