// "use client";

// import React, { useEffect } from "react";
// import { useRouter } from "next/navigation";

// export default function RequireAuth({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const router = useRouter();

//   useEffect(() => {
//     const hasToken = document.cookie
//       .split("; ")
//       .some((c) => c.startsWith("access_token="));

//     if (!hasToken) {
//       router.replace("/login");
//     }
//   }, [router]);

//   return <>{children}</>;
// }
