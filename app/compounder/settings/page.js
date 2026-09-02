"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Shell from "@/components/Shell";
import Badge from "@/components/Badge";

export default function CompounderSettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // =========================
  // PROFILE
  // =========================

  const [compounder, setCompounder] = useState(null);
  const [phone, setPhone] = useState("");

  // =========================
  // PROFILE PICTURE
  // =========================

  const [selectedPicture, setSelectedPicture] = useState(null);
  const [picturePreview, setPicturePreview] = useState("");

  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [removingPicture, setRemovingPicture] = useState(false);

  const [pictureError, setPictureError] = useState("");
  const [pictureSuccess, setPictureSuccess] = useState("");

  // =========================
  // PASSWORD
  // =========================

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // =========================
  // STATES
  // =========================

  const [loading, setLoading] = useState(true);

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // =========================
  // LOAD SETTINGS
  // =========================

  async function loadSettings() {
    try {
      setLoading(true);
      setProfileError("");

      const response = await fetch("/api/compounder/settings", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (response.status === 403) {
        router.replace("/unauthorized");
        return;
      }

      if (!response.ok) {
        setProfileError(data.message || "Unable to load settings.");
        return;
      }

      setCompounder(data.compounder || null);
      setPhone(data.compounder?.phone || "");
    } catch (error) {
      console.error("LOAD COMPOUNDER SETTINGS ERROR:", error);

      setProfileError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  // =========================
  // INITIALS
  // =========================

  function getInitials(name) {
    if (!name) {
      return "C";
    }

    return name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  // =========================
  // SELECT PICTURE
  // =========================

  function handlePictureSelect(event) {
    const file = event.target.files?.[0];

    setPictureError("");
    setPictureSuccess("");

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setPictureError("Only JPG, PNG and WebP profile pictures are allowed.");

      event.target.value = "";
      return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      setPictureError("Profile picture must be 2 MB or smaller.");

      event.target.value = "";
      return;
    }

    if (picturePreview) {
      URL.revokeObjectURL(picturePreview);
    }

    const preview = URL.createObjectURL(file);

    setSelectedPicture(file);
    setPicturePreview(preview);
  }

  // =========================
  // CANCEL PICTURE
  // =========================

  function handleCancelPicture() {
    if (picturePreview) {
      URL.revokeObjectURL(picturePreview);
    }

    setSelectedPicture(null);
    setPicturePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // =========================
  // UPLOAD PROFILE PICTURE
  // =========================

  async function handleUploadPicture() {
    if (!selectedPicture) {
      setPictureError("Please select a profile picture.");
      return;
    }

    try {
      setUploadingPicture(true);

      setPictureError("");
      setPictureSuccess("");

      const formData = new FormData();

      formData.append("profile_picture", selectedPicture);

      const response = await fetch("/api/compounder/settings/profile-picture", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (response.status === 403) {
        router.replace("/unauthorized");
        return;
      }

      if (!response.ok) {
        setPictureError(data.message || "Unable to upload profile picture.");
        return;
      }

      setCompounder(data.compounder || null);

      setPictureSuccess(
        data.message || "Profile picture updated successfully.",
      );

      handleCancelPicture();
    } catch (error) {
      console.error("UPLOAD PROFILE PICTURE ERROR:", error);

      setPictureError("Unable to upload profile picture.");
    } finally {
      setUploadingPicture(false);
    }
  }

  // =========================
  // REMOVE PROFILE PICTURE
  // =========================

  async function handleRemovePicture() {
    try {
      setRemovingPicture(true);

      setPictureError("");
      setPictureSuccess("");

      const response = await fetch("/api/compounder/settings/profile-picture", {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (response.status === 403) {
        router.replace("/unauthorized");
        return;
      }

      if (!response.ok) {
        setPictureError(data.message || "Unable to remove profile picture.");
        return;
      }

      setCompounder(data.compounder || null);

      handleCancelPicture();

      setPictureSuccess(
        data.message || "Profile picture removed successfully.",
      );
    } catch (error) {
      console.error("REMOVE PROFILE PICTURE ERROR:", error);

      setPictureError("Unable to remove profile picture.");
    } finally {
      setRemovingPicture(false);
    }
  }

  // =========================
  // PROFILE UPDATE
  // =========================

  async function handleProfileSubmit(event) {
    event.preventDefault();

    try {
      setSavingProfile(true);

      setProfileError("");
      setProfileSuccess("");

      const response = await fetch("/api/compounder/settings", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          phone: phone.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (response.status === 403) {
        router.replace("/unauthorized");
        return;
      }

      if (!response.ok) {
        setProfileError(data.message || "Unable to update profile.");
        return;
      }

      setCompounder(data.compounder || null);
      setPhone(data.compounder?.phone || "");

      setProfileSuccess(data.message || "Profile updated successfully.");
    } catch (error) {
      console.error("UPDATE COMPOUNDER PROFILE ERROR:", error);

      setProfileError("Unable to connect to the server.");
    } finally {
      setSavingProfile(false);
    }
  }

  // =========================
  // PASSWORD INPUT
  // =========================

  function handlePasswordChange(event) {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // =========================
  // PASSWORD SUBMIT
  // =========================

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordForm.current_password) {
      setPasswordError("Current password is required.");
      return;
    }

    if (!passwordForm.new_password) {
      setPasswordError("New password is required.");
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (passwordForm.current_password === passwordForm.new_password) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await fetch("/api/compounder/settings/password", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (response.status === 403) {
        router.replace("/unauthorized");
        return;
      }

      if (!response.ok) {
        setPasswordError(data.message || "Unable to change password.");
        return;
      }

      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });

      setPasswordSuccess(data.message || "Password changed successfully.");
    } catch (error) {
      console.error("CHANGE COMPOUNDER PASSWORD ERROR:", error);

      setPasswordError("Unable to connect to the server.");
    } finally {
      setChangingPassword(false);
    }
  }

  // =========================
  // DATE
  // =========================

  function formatDateTime(value) {
    if (!value) {
      return "Not available";
    }

    return new Date(value).toLocaleString();
  }

  // =========================
  // CLEANUP PREVIEW
  // =========================

  useEffect(() => {
    return () => {
      if (picturePreview) {
        URL.revokeObjectURL(picturePreview);
      }
    };
  }, [picturePreview]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <Shell
        role="compounder"
        title="Settings"
        subtitle="Account and clinic preferences"
      >
        <div className="max-w-4xl rounded-2xl border bg-white px-6 py-20 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

          <p className="mt-4 text-sm text-slate-500">Loading settings...</p>
        </div>
      </Shell>
    );
  }

  if (!compounder) {
    return (
      <Shell
        role="compounder"
        title="Settings"
        subtitle="Account and clinic preferences"
      >
        <div className="max-w-4xl rounded-2xl border bg-white p-8">
          <p className="text-sm text-red-600">
            {profileError || "Unable to load account."}
          </p>
        </div>
      </Shell>
    );
  }

  const profileImage = picturePreview || compounder.profile_picture || "";

  // =========================
  // PAGE
  // =========================

  return (
    <Shell
      role="compounder"
      title="Settings"
      subtitle="Account and clinic preferences"
      user={compounder}
    >
      <div className="max-w-4xl space-y-6">
        {/* =========================
            PROFILE PICTURE
        ========================== */}

        <section className="overflow-hidden rounded-2xl border bg-white">
          <div className="border-b p-5">
            <h2 className="font-semibold text-slate-950">Profile picture</h2>

            <p className="mt-1 text-xs text-slate-500">
              Upload a picture for your clinic account.
            </p>
          </div>

          <div className="p-6">
            {pictureError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {pictureError}
              </div>
            )}

            {pictureSuccess && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {pictureSuccess}
              </div>
            )}

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-950 text-white">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={compounder.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-2xl font-bold">
                    {getInitials(compounder.name)}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-slate-900">
                  {compounder.name}
                </p>

                <p className="mt-1 text-sm text-slate-500">Compounder</p>

                <p className="mt-3 text-xs text-slate-400">
                  JPG, PNG or WebP. Maximum file size 2 MB.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePictureSelect}
                  className="hidden"
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={uploadingPicture || removingPicture}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                  >
                    Choose photo
                  </button>

                  {selectedPicture && (
                    <>
                      <button
                        type="button"
                        disabled={uploadingPicture}
                        onClick={handleUploadPicture}
                        className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {uploadingPicture ? "Uploading..." : "Save photo"}
                      </button>

                      <button
                        type="button"
                        disabled={uploadingPicture}
                        onClick={handleCancelPicture}
                        className="rounded-xl border px-4 py-2.5 text-sm font-medium disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {compounder.profile_picture && !selectedPicture && (
                    <button
                      type="button"
                      disabled={removingPicture}
                      onClick={handleRemovePicture}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 disabled:opacity-50"
                    >
                      {removingPicture ? "Removing..." : "Remove photo"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            PROFILE INFORMATION
        ========================== */}

        <section className="overflow-hidden rounded-2xl border bg-white">
          <div className="border-b p-5">
            <h2 className="font-semibold text-slate-950">Profile</h2>

            <p className="mt-1 text-xs text-slate-500">
              Review your account information and update your contact number.
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} className="p-6">
            {profileError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {profileSuccess}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Full name
                <input
                  value={compounder.name || ""}
                  disabled
                  className="mt-2 w-full rounded-xl border bg-slate-100 px-4 py-3 text-slate-500"
                />
                <span className="mt-1 block text-xs font-normal text-slate-400">
                  Managed by hospital administration.
                </span>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Email
                <input
                  value={compounder.email || ""}
                  disabled
                  className="mt-2 w-full rounded-xl border bg-slate-100 px-4 py-3 text-slate-500"
                />
                <span className="mt-1 block text-xs font-normal text-slate-400">
                  Contact administration to update your login email.
                </span>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Phone number
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={savingProfile}
                  placeholder="03xx-xxxxxxx"
                  className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />
              </label>

              <div>
                <p className="text-sm font-medium text-slate-700">Role</p>

                <div className="mt-3">
                  <Badge tone="blue">Compounder</Badge>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Role is managed by hospital administration.
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700">
                  Account status
                </p>

                <div className="mt-3">
                  <Badge tone={compounder.is_active ? "green" : "red"}>
                    {compounder.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700">Last login</p>

                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {compounder.last_login_at
                    ? formatDateTime(compounder.last_login_at)
                    : "First login"}
                </p>
              </div>
            </div>

            <div className="mt-7 flex justify-end border-t pt-5">
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {savingProfile ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </section>

        {/* =========================
            PASSWORD
        ========================== */}

        <section className="overflow-hidden rounded-2xl border bg-white">
          <div className="border-b p-5">
            <h2 className="font-semibold text-slate-950">
              Password & security
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Change your account password using your current password.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="p-6">
            {passwordError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {passwordSuccess}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700 md:col-span-2">
                Current password
                <input
                  type="password"
                  name="current_password"
                  value={passwordForm.current_password}
                  onChange={handlePasswordChange}
                  disabled={changingPassword}
                  autoComplete="current-password"
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                New password
                <input
                  type="password"
                  name="new_password"
                  value={passwordForm.new_password}
                  onChange={handlePasswordChange}
                  disabled={changingPassword}
                  autoComplete="new-password"
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />
                <span className="mt-1 block text-xs font-normal text-slate-400">
                  Minimum 8 characters.
                </span>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Confirm new password
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordForm.confirm_password}
                  onChange={handlePasswordChange}
                  disabled={changingPassword}
                  autoComplete="new-password"
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />
              </label>
            </div>

            <div className="mt-7 flex justify-end border-t pt-5">
              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {changingPassword ? "Changing password..." : "Change password"}
              </button>
            </div>
          </form>
        </section>

        {/* ADMIN */}

        <section className="rounded-2xl border bg-slate-50 p-5">
          <h3 className="font-semibold text-slate-900">
            Administration controlled information
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your full name, email address, role and account status are part of
            your official hospital account. Contact hospital administration if
            any of this information needs to be corrected.
          </p>
        </section>
      </div>
    </Shell>
  );
}
