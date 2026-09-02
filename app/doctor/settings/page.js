"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Shell from "@/components/Shell";
import Badge from "@/components/Badge";

export default function DoctorSettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // ======================================================
  // DOCTOR PROFILE
  // ======================================================

  const [doctor, setDoctor] = useState(null);
  const [phone, setPhone] = useState("");

  // ======================================================
  // PROFILE PICTURE
  // ======================================================

  const [selectedPicture, setSelectedPicture] = useState(null);
  const [picturePreview, setPicturePreview] = useState("");

  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [removingPicture, setRemovingPicture] = useState(false);

  const [pictureError, setPictureError] = useState("");
  const [pictureSuccess, setPictureSuccess] = useState("");

  // ======================================================
  // PASSWORD
  // ======================================================

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // ======================================================
  // PAGE STATES
  // ======================================================

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // ======================================================
  // LOAD SETTINGS
  // ======================================================

  async function loadSettings() {
    try {
      setLoading(true);
      setProfileError("");

      const response = await fetch("/api/doctors/settings", {
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

      setDoctor(data.doctor || null);
      setPhone(data.doctor?.phone || "");
    } catch (error) {
      console.error("LOAD DOCTOR SETTINGS ERROR:", error);

      setProfileError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  // ======================================================
  // INITIALS
  // ======================================================

  function getInitials(name) {
    if (!name) {
      return "D";
    }

    return name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  // ======================================================
  // SELECT PROFILE PICTURE
  // ======================================================

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

    if (file.size <= 0) {
      setPictureError("The selected image is empty.");

      event.target.value = "";
      return;
    }

    if (file.size > maxSize) {
      setPictureError("Profile picture must be 2 MB or smaller.");

      event.target.value = "";
      return;
    }

    if (picturePreview) {
      URL.revokeObjectURL(picturePreview);
    }

    setSelectedPicture(file);
    setPicturePreview(URL.createObjectURL(file));
  }

  // ======================================================
  // CLEAR SELECTED PICTURE
  // ======================================================

  function clearSelectedPicture() {
    if (picturePreview) {
      URL.revokeObjectURL(picturePreview);
    }

    setSelectedPicture(null);
    setPicturePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // ======================================================
  // UPLOAD / CHANGE PROFILE PICTURE
  // ======================================================

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

      const response = await fetch("/api/doctors/settings/profile-picture", {
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

      setDoctor(data.doctor || null);
      setPhone(data.doctor?.phone || phone);

      clearSelectedPicture();

      setPictureSuccess(
        data.message || "Profile picture updated successfully.",
      );

      router.refresh();
    } catch (error) {
      console.error("UPLOAD DOCTOR PROFILE PICTURE ERROR:", error);

      setPictureError("Unable to upload profile picture.");
    } finally {
      setUploadingPicture(false);
    }
  }

  // ======================================================
  // REMOVE PROFILE PICTURE
  // ======================================================

  async function handleRemovePicture() {
    if (!doctor?.profile_picture) {
      setPictureError("No profile picture is currently uploaded.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove your profile picture?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingPicture(true);
      setPictureError("");
      setPictureSuccess("");

      const response = await fetch("/api/doctors/settings/profile-picture", {
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

      clearSelectedPicture();

      setDoctor(data.doctor || null);
      setPhone(data.doctor?.phone || phone);

      setPictureSuccess(
        data.message || "Profile picture removed successfully.",
      );

      router.refresh();
    } catch (error) {
      console.error("REMOVE DOCTOR PROFILE PICTURE ERROR:", error);

      setPictureError("Unable to remove profile picture.");
    } finally {
      setRemovingPicture(false);
    }
  }

  // ======================================================
  // SAVE PHONE
  // ======================================================

  async function handleProfileSubmit(event) {
    event.preventDefault();

    try {
      setSavingProfile(true);
      setProfileError("");
      setProfileSuccess("");

      const response = await fetch("/api/doctors/settings", {
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

      setDoctor(data.doctor || null);
      setPhone(data.doctor?.phone || "");

      setProfileSuccess(data.message || "Profile updated successfully.");

      router.refresh();
    } catch (error) {
      console.error("UPDATE DOCTOR PROFILE ERROR:", error);

      setProfileError("Unable to connect to the server.");
    } finally {
      setSavingProfile(false);
    }
  }

  // ======================================================
  // PASSWORD
  // ======================================================

  function handlePasswordChange(event) {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

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

      const response = await fetch("/api/doctors/settings/password", {
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
      console.error("CHANGE PASSWORD ERROR:", error);

      setPasswordError("Unable to connect to the server.");
    } finally {
      setChangingPassword(false);
    }
  }

  // ======================================================
  // HELPERS
  // ======================================================

  function formatDateTime(value) {
    if (!value) {
      return "Not available";
    }

    return new Date(value).toLocaleString();
  }

  useEffect(() => {
    return () => {
      if (picturePreview) {
        URL.revokeObjectURL(picturePreview);
      }
    };
  }, [picturePreview]);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <Shell role="doctor" title="Settings" subtitle="Manage your account">
        <div className="max-w-5xl rounded-2xl border bg-white px-6 py-20 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

          <p className="mt-4 text-sm text-slate-500">Loading settings...</p>
        </div>
      </Shell>
    );
  }

  if (!doctor) {
    return (
      <Shell role="doctor" title="Settings" subtitle="Manage your account">
        <div className="max-w-5xl rounded-2xl border bg-white p-8">
          <p className="text-sm text-red-600">
            {profileError || "Unable to load account."}
          </p>
        </div>
      </Shell>
    );
  }

  const profileImage = picturePreview || doctor.profile_picture || "";

  return (
    <Shell
      role="doctor"
      title="Settings"
      subtitle="Manage your account and security"
      user={doctor}
    >
      <div className="max-w-5xl space-y-6">
        {/* =================================================
            ACCOUNT SUMMARY
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border bg-white">
          <div className="bg-gradient-to-r from-slate-950 to-slate-800 p-6 text-white">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                  {doctor.profile_picture ? (
                    <img
                      src={doctor.profile_picture}
                      alt={`${doctor.name} profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xl font-bold">
                      {getInitials(doctor.name)}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Doctor account
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">{doctor.name}</h2>

                  <p className="mt-1 text-sm text-slate-300">{doctor.email}</p>
                </div>
              </div>

              <Badge tone={doctor.is_active ? "green" : "red"}>
                {doctor.is_active ? "Active account" : "Inactive account"}
              </Badge>
            </div>
          </div>
        </section>

        {/* =================================================
            PROFILE PICTURE
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border bg-white">
          <div className="border-b p-5">
            <h2 className="font-semibold text-slate-950">Profile picture</h2>

            <p className="mt-1 text-xs text-slate-500">
              This photo appears in your doctor account and dashboard header.
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

            <div className="grid gap-6 lg:grid-cols-[140px_1fr] lg:items-center">
              <div className="mx-auto h-32 w-32 overflow-hidden rounded-3xl border bg-slate-950 text-white lg:mx-0">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={`${doctor.name} profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-3xl font-bold">
                    {getInitials(doctor.name)}
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{doctor.name}</p>

                  {doctor.profile_picture && (
                    <Badge tone="green">Photo added</Badge>
                  )}
                </div>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Upload a clear professional photo. JPG, PNG and WebP files are
                  supported up to 2 MB.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePictureSelect}
                  disabled={uploadingPicture || removingPicture}
                  className="hidden"
                />

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={uploadingPicture || removingPicture}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {doctor.profile_picture
                      ? "Choose new photo"
                      : "Choose photo"}
                  </button>

                  {selectedPicture && (
                    <>
                      <button
                        type="button"
                        disabled={uploadingPicture || removingPicture}
                        onClick={handleUploadPicture}
                        className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {uploadingPicture
                          ? "Uploading..."
                          : doctor.profile_picture
                            ? "Save new photo"
                            : "Save photo"}
                      </button>

                      <button
                        type="button"
                        disabled={uploadingPicture}
                        onClick={() => {
                          clearSelectedPicture();
                          setPictureError("");
                        }}
                        className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {doctor.profile_picture && !selectedPicture && (
                    <button
                      type="button"
                      disabled={removingPicture || uploadingPicture}
                      onClick={handleRemovePicture}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {removingPicture ? "Removing..." : "Remove photo"}
                    </button>
                  )}
                </div>

                {selectedPicture && (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Selected image
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                          {selectedPicture.name}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs text-slate-500">
                        {(selectedPicture.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            PROFILE INFORMATION
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border bg-white">
          <div className="border-b p-5">
            <h2 className="font-semibold text-slate-950">
              Profile information
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Review your official account information and update your phone
              number.
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
                  value={doctor.name || ""}
                  disabled
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                />
                <span className="mt-1.5 block text-xs font-normal text-slate-400">
                  Managed by hospital administration.
                </span>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Email address
                <input
                  value={doctor.email || ""}
                  disabled
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                />
                <span className="mt-1.5 block text-xs font-normal text-slate-400">
                  Contact administration to change your login email.
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
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />
              </label>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Role
                </p>

                <div className="mt-3">
                  <Badge tone="blue">Doctor</Badge>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Account status
                </p>

                <div className="mt-3">
                  <Badge tone={doctor.is_active ? "green" : "red"}>
                    {doctor.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Last login
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {doctor.last_login_at
                    ? formatDateTime(doctor.last_login_at)
                    : "First login"}
                </p>
              </div>
            </div>

            <div className="mt-7 flex justify-end border-t border-slate-200 pt-5">
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingProfile ? "Saving..." : "Save phone number"}
              </button>
            </div>
          </form>
        </section>

        {/* =================================================
            PASSWORD
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border bg-white">
          <div className="border-b p-5">
            <h2 className="font-semibold text-slate-950">
              Password & security
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Use your current password to securely set a new password.
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
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
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
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />
                <span className="mt-1.5 block text-xs font-normal text-slate-400">
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
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />
              </label>
            </div>

            <div className="mt-7 flex justify-end border-t border-slate-200 pt-5">
              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {changingPassword ? "Changing password..." : "Change password"}
              </button>
            </div>
          </form>
        </section>

        {/* =================================================
            ADMIN CONTROLLED
        ================================================= */}

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="font-semibold text-slate-900">
            Administration controlled information
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Your full name, email address, role and account status are part of
            your official hospital account. Contact hospital administration if
            any of these details need to be corrected.
          </p>
        </section>
      </div>
    </Shell>
  );
}
