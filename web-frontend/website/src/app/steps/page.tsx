/* src/app/resume-import/page.tsx */
export const dynamic = "force-dynamic";
import React from "react";

import Steps from "../../components/onboarding/steps";

export default function ResumeImportPage() {
  return (
    <main className="container">
      {/* We just render the component here */}
      <Steps />
    </main>
  );
}
