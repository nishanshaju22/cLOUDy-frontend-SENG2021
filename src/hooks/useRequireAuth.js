"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "../lib/auth";

export function useRequireAuth() {
  const router = useRouter();
  const [auth, setAuth] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const stored = getAuth();

    if (!stored?.user || !stored?.seller) {
      router.replace("/login");
      return;
    }

    setAuth(stored);
    setCheckingAuth(false);
  }, [router]);

  return {
    auth,
    checkingAuth,
    sellerId: auth?.seller?.seller_id || auth?.user?.seller_id || null,
  };
}