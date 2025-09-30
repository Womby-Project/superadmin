// hooks/useDoctors.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Doctor {
  id: string;
  name: string;
  gender: string | null;
  email: string;
  prcLicenseNumber: string;
  phoneNumber?: string | null;
  birthDate?: string | null;
  education?: string | null;
  affiliatedHospitalsClinics: string[];
  profilePictureUrl: string;
  isVerified: boolean;
  createdAt: string;
}

export function useDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("obgyn_users")
        .select(`
          id,
          first_name,
          last_name,
          gender,
          email,
          prc_license_number,
          phone_number,
          birth_date,
          education,
          affiliated_hospitals_clinics,
          profile_picture_url,
          is_verified,
          created_at
        `);

      if (error) {
        console.error("Error fetching doctors:", error.message);
        setDoctors([]);
      } else {
        const mapped: Doctor[] = (data ?? []).map((doc: any) => ({
          id: doc.id,
          name: `${doc.first_name} ${doc.last_name}`,
          gender: doc.gender,
          email: doc.email,
          prcLicenseNumber: doc.prc_license_number,
          phoneNumber: doc.phone_number,
          birthDate: doc.birth_date,
          education: doc.education,
          affiliatedHospitalsClinics: doc.affiliated_hospitals_clinics ?? [],
          profilePictureUrl: doc.profile_picture_url ?? "/doctor.png",
          isVerified: doc.is_verified,
          createdAt: doc.created_at,
        }));
        setDoctors(mapped);
      }

      setLoading(false);
    };

    fetchDoctors();
  }, []);

  return { doctors, loading };
}
