import React, { useEffect } from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabaseClient";
import type { Doctor } from "@/hooks/useDoctor"; // ✅ match file name

interface ObgynDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="border-t border-gray-200 pt-2 mt-2 first-of-type:mt-3 first-of-type:border-t-0 first-of-type:pt-0">
    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
      {title}
    </h3>
    {children}
  </div>
);

const StatusBadge: React.FC<{ verified: boolean }> = ({ verified }) => (
  <span
    className={`px-2 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1.5 w-fit ${
      verified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
    }`}
  >
    <span
      className={`h-2 w-2 rounded-full ${
        verified ? "bg-green-600" : "bg-gray-500"
      }`}
    ></span>
    {verified ? "Active" : "Inactive"}
  </span>
);

/**
 * Resolve a Supabase Storage path or absolute URL to a browsable URL.
 * Uses a signed URL for private buckets.
 */
async function resolvePrcImageUrl(
  stored: string | null | undefined,
  bucket = "prc_ids" // 🔁 set this to your actual bucket
): Promise<string | null> {
  if (!stored) return null;

  // Already absolute?
  if (/^https?:\/\//i.test(stored)) return stored;

  // Private bucket: create a short-lived signed URL
  const { data: signed, error: signErr } = await supabase.storage
    .from(bucket)
    .createSignedUrl(stored, 60 * 10); // 10 minutes
  if (signed?.signedUrl) return signed.signedUrl;

  // Public bucket fallback
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(stored);
  if (pub?.publicUrl) return pub.publicUrl;

  console.warn("Unable to resolve PRC image URL:", signErr?.message);
  return null;
}

export default function ObgynDetails({
  isOpen,
  onClose,
  doctor,
}: ObgynDetailsProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isRevealed, setIsRevealed] = React.useState(false);

  // PRC image state
  const [showPrcModal, setShowPrcModal] = React.useState(false);
  const [prcImgLoaded, setPrcImgLoaded] = React.useState(false);
  const [prcImgError, setPrcImgError] = React.useState(false);
  const [prcResolvedUrl, setPrcResolvedUrl] = React.useState<string | null>(null);

  // ✅ ref to detect cached/instant loads where onLoad may not fire
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  // 🔒 Disable background scroll when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [isOpen]);

  // Resolve image URL when modal opens or doctor changes
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setPrcImgLoaded(false);
      setPrcImgError(false);
      setPrcResolvedUrl(null);

      if (!doctor?.prcIdImageUrl) return;

      const url = await resolvePrcImageUrl(doctor.prcIdImageUrl, "doctor_docs"); // 🔁 bucket
      if (!cancelled) setPrcResolvedUrl(url);
    }

    if (isOpen && doctor?.prcIdImageUrl) {
      run();
    } else {
      setPrcResolvedUrl(null);
    }

    return () => {
      cancelled = true;
    };
  }, [isOpen, doctor?.prcIdImageUrl]);

  // ✅ If browser already has the image cached, mark it as loaded
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    if (el.complete && el.naturalWidth > 0) {
      setPrcImgLoaded(true);
    }
  }, [prcResolvedUrl]);

  if (!isOpen || !doctor) return null;

  const safeContact = {
    phone: doctor.phoneNumber || "N/A",
    email: doctor.email || "N/A",
  };

  const safeHospitals = doctor.affiliatedHospitalsClinics || [];
  const safeEducation = doctor.education || "N/A";

  const age =
    doctor.birthDate && !isNaN(new Date(doctor.birthDate).getTime())
      ? new Date().getFullYear() - new Date(doctor.birthDate).getFullYear()
      : "N/A";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-2xl h-[670px] bg-white rounded-xl shadow-2xl p-6 overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
        >
          <Icon icon="mdi:close" className="w-6 h-6 text-gray-500" />
        </button>

        {/* Blur gate */}
        {!isRevealed && (
          <div className="absolute inset-0 bg-grey/10 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6">
            <Icon icon="mdi:shield-lock-outline" className="text-red-500 w-14 h-14 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Sensitive Information</h2>
            <p className="text-gray-600 text-sm max-w-sm mb-6">
              Doctor’s personal and professional information is confidential. Please proceed only if you have proper authorization.
            </p>
            <button
              onClick={() => setIsRevealed(true)}
              className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow-lg transition-colors"
            >
              See Doctor’s Information
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between -mt-1">
          <div className="flex items-center gap-4">
            <img
              src={doctor.profilePictureUrl || "/doctor.png"}
              alt={doctor.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{doctor.name}</h2>
              <p className="text-sm text-gray-500">
                {doctor.gender || "N/A"} - {age} years old
              </p>
              <div className="mt-2">
                <StatusBadge verified={doctor.isVerified} />
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <Icon icon="mdi:dots-horizontal" className="w-6 h-6" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  Disable Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className={isRevealed ? "opacity-100" : "opacity-30 pointer-events-none"}>
          <InfoSection title="Contact Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-2.5 bg-gray-50">
                <Icon icon="ph:phone" className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-800">{safeContact.phone}</span>
              </div>
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg p-2.5 bg-gray-50">
                <Icon icon="ph:envelope" className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-800">{safeContact.email}</span>
              </div>
            </div>
          </InfoSection>

          <InfoSection title="Affiliated Hospitals">
            <ul className="space-y-1 text-sm text-gray-700">
              {safeHospitals.length > 0 ? (
                safeHospitals.map((h: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, i: React.Key | null | undefined) => <li key={i}>{h}</li>)
              ) : (
                <li className="text-gray-400">No affiliated hospitals listed</li>
              )}
            </ul>
          </InfoSection>

          <InfoSection title="Education">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
              <p className="font-semibold text-gray-800">{safeEducation}</p>
            </div>
          </InfoSection>

          {/* PRC ID */}
          <InfoSection title="PRC ID">
            <div className="flex flex-col gap-2">
              {/* License number */}
              <div className="flex items-center gap-3">
                <Icon icon="mdi:card-account-details-outline" className="w-5 h-5 text-gray-500" />
                <p className="text-sm font-medium text-gray-800">
                  {doctor.prcLicenseNumber || "N/A"}
                </p>
              </div>

              {/* Framed image preview */}
              <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm group">
                {/* Decorative glow */}
                <div className="pointer-events-none absolute inset-0 opacity-60">
                  <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-rose-400/10 blur-2xl" />
                  <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-emerald-400/10 blur-2xl" />
                </div>

                {/* Image area */}
                <div className="relative w-full h-40 sm:h-44">
                  {/* Skeleton */}
                  {prcResolvedUrl && !prcImgLoaded && !prcImgError && (
                    <div className="absolute inset-0 animate-pulse bg-gray-100" />
                  )}

                  {/* Placeholder */}
                  {!prcResolvedUrl || prcImgError ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center px-4 py-6 text-xs text-gray-500">
                        <Icon
                          icon="mdi:id-card-outline"
                          className="mx-auto mb-2 h-8 w-8 text-gray-400"
                        />
                        <p className="font-medium">No PRC ID photo</p>
                        <p className="text-[11px]">Ask the doctor to upload for verification</p>
                      </div>
                    </div>
                  ) : (
                    <img
                      key={prcResolvedUrl}                 // ✅ ensure fresh load on URL change
                      ref={imgRef}                          // ✅ detect cached loads
                      src={prcResolvedUrl}
                      alt={`${doctor.name} — PRC ID`}
                      loading="eager"                      // ✅ do not defer
                      fetchPriority="high"                 // ✅ HTML standard attr (lowercase)
                      decoding="async"
                      onLoad={() => setPrcImgLoaded(true)}
                      onError={() => setPrcImgError(true)}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>

                {/* Footer */}
                <div className="relative z-10 border-t border-gray-200 bg-white/70 backdrop-blur px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <Icon icon="mdi:shield-account" className="h-4 w-4 text-emerald-600" />
                    <span>For identity & license verification with PRC</span>
                  </div>

                  {prcResolvedUrl && !prcImgError && (
                    <button
                      type="button"
                      onClick={() => setShowPrcModal(true)}
                      className="text-xs font-semibold text-rose-500 hover:underline inline-flex items-center gap-1"
                    >
                      View full
                      <Icon icon="lsicon:open-new-filled" className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </InfoSection>
        </div>
      </div>

      {/* Full PRC preview */}
      {showPrcModal && prcResolvedUrl && !prcImgError && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="PRC ID full preview"
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowPrcModal(false)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowPrcModal(false)}
              className="absolute -top-10 right-0 text-white/90 hover:text-white inline-flex items-center gap-1"
            >
              <Icon icon="mdi:close" className="h-6 w-6" />
              <span className="text-sm">Close</span>
            </button>

            <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 bg-black">
              <img
                src={prcResolvedUrl}
                alt={`${doctor.name} — PRC ID (full)`}
                className="w-full h-auto max-h-[78vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
