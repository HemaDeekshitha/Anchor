"use client";

import { useSearchParams } from "next/navigation";

export default function ResumeViewer() {
  const params = useSearchParams();
  const url = params.get("url");

  if (!url) return <div>No resume found</div>;

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <iframe src={url} width="100%" height="100%" style={{ border: "none" }} />
    </div>
  );
}
