// "use client";
// import React, { use, useState } from "react";
// import styles from "./Contact.module.css";
// import Header from "../LandingPage/Header/Header";
// import { useRouter } from "next/navigation";
// import { Upload, X } from "lucide-react";
// import AlertBox, { AlertBoxProps } from "../Components/AlertBox/AlertBox";
// import { s } from "framer-motion/client";

// export default function Contact() {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");
//   const [selectedFile, setSelectedFile] = useState("Upload Resume");
//   const [alert, setAlert] = useState<{
//     show: boolean;
//     type: "success" | "error" | "warning" | null;
//     message: string;
//   }>({
//     show: false,
//     type: null,
//     message: "",
//   });

//   const router = useRouter();

//   const showAlert = (
//     type: "success" | "error" | "warning",
//     message: string
//   ) => {
//     setAlert({ show: true, type, message });

//     setTimeout(() => {
//       setAlert({ show: false, type: null, message: "" });
//     }, 3000);
//   };

//   const isFormValid =
//     name.trim() !== "" && email.trim() !== "" && message.trim() !== "";

//   // const handleSubmit = async (e: any) => {
//   //   e.preventDefault(); // 👈 Fix form refresh
//   //   setName("");
//   //   setEmail("");
//   //   setMessage("");
//   //   setSelectedFile("Upload Resume");

//   //   if (selectedFile === "Upload Resume") {
//   //     showAlert("warning", "Please upload your resume.");
//   //     return;
//   //   }

//   //   const res = await fetch("http://localhost:3001/contact", {
//   //     method: "POST",
//   //     headers: { "Content-Type": "application/json" },
//   //     body: JSON.stringify({ name, email, message }),
//   //   });

//   //   if (res.ok) {
//   //     showAlert("success", "Your message has been sent successfully!");
//   //   } else {
//   //     showAlert("error", "Something went wrong. Please try again.");
//   //   }
//   // };

//   const handleSubmit = async (e: any) => {
//     e.preventDefault();

//     if (selectedFile === "Upload Resume") {
//       showAlert("warning", "Please upload your resume.");
//       return;
//     }

//     const fileInput = document.querySelector(
//       'input[name="resume"]'
//     ) as HTMLInputElement;

//     const formData = new FormData();
//     formData.append("name", name);
//     formData.append("email", email);
//     formData.append("message", message);
//     formData.append("resume", fileInput.files![0]); // file

//     const res = await fetch("http://localhost:3001/contact/upload", {
//       method: "POST",
//       body: formData,
//     });

//     if (res.ok) {
//       showAlert("success", "Message & resume submitted!");
//     } else {
//       showAlert("error", "Upload failed");
//     }

//     setName("");
//     setEmail("");
//     setMessage("");
//     setSelectedFile("Upload Resume");
//   };

//   const handleBack = () => {
//     if (document.referrer && document.referrer !== window.location.href) {
//       router.back(); // real browser back
//     } else {
//       router.push("/LandingPage"); // your landing page route
//     }
//   };

//   return (
//     <>
//       {alert.show && alert.type && (
//         <AlertBox
//           type={alert.type}
//           message={alert.message}
//           onClose={() => setAlert({ show: false, type: null, message: "" })}
//         />
//       )}

//       <div id="home" className={styles.ContactPageContainer}>
//         <Header />
//         <div className={styles.ContactPageMain}>
//           <div className={styles.ContactPageContent}>
//             <div className={styles.backButtonContainer}>
//               <button className={styles.backButton} onClick={handleBack}>
//                 &larr; Back
//               </button>
//             </div>
//             <h1 className={styles.title}>First steps start here.</h1>
//             <p className={styles.subtitle}>
//               Have questions, need help, or want to discover more about Anchor?
//               We're here to support you every step of the way.
//             </p>
//             <form className={styles.contactForm} onSubmit={handleSubmit}>
//               <label className={styles.label}>
//                 <span>
//                   Name <span className={styles.required}>*</span>
//                 </span>
//                 <input
//                   type="text"
//                   name="name"
//                   className={styles.input}
//                   placeholder="User name"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   required
//                 />
//               </label>
//               <label className={styles.label}>
//                 <span>
//                   Email <span className={styles.required}>*</span>
//                 </span>
//                 <input
//                   type="email"
//                   name="email"
//                   className={styles.input}
//                   placeholder="Email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </label>
//               <label className={styles.label}>
//                 Message:
//                 <textarea
//                   name="message"
//                   className={styles.textarea}
//                   placeholder="Optional"
//                 />
//               </label>
//               <label className={styles.labelWrapper}>
//                 <span className={styles.labelText}>
//                   Tell us about yourself{" "}
//                   <span className={styles.required}>*</span>
//                 </span>

//                 <label className={styles.customFileUpload}>
//                   <Upload size={18} className={styles.iconLeft} />

//                   {selectedFile}

//                   {selectedFile !== "Upload Resume" && (
//                     <X
//                       size={18}
//                       className={styles.iconRight}
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setSelectedFile("Upload Resume");
//                       }}
//                     />
//                   )}

//                   <input
//                     type="file"
//                     name="resume"
//                     className={styles.hiddenFileInput}
//                     // required
//                     accept=".pdf,.doc,.docx"
//                     onChange={(e) => {
//                       const file = e.target.files?.[0];
//                       if (file) setSelectedFile(file.name);
//                     }}
//                   />
//                 </label>
//               </label>

//               <button type="submit" className={styles.submitButton}>
//                 Send Message
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";
import React, { use, useState } from "react";
import styles from "./Contact.module.css";
import Header from "../LandingPage/Header/Header";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import AlertBox, { AlertBoxProps } from "../Components/AlertBox/AlertBox";
import { s } from "framer-motion/client";
import { Box, Typography } from "@mui/material";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState("Upload Resume");
  const [alert, setAlert] = useState<{
    show: boolean;
    type: "success" | "error" | "warning" | null;
    message: string;
  }>({
    show: false,
    type: null,
    message: "",
  });

  const router = useRouter();

  const showAlert = (
    type: "success" | "error" | "warning",
    message: string
  ) => {
    setAlert({ show: true, type, message });

    setTimeout(() => {
      setAlert({ show: false, type: null, message: "" });
    }, 3000);
  };

  const isFormValid =
    name.trim() !== "" && email.trim() !== "" && message.trim() !== "";

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (selectedFile === "Upload Resume") {
      showAlert("warning", "Please upload your resume.");
      return;
    }

    const fileInput = document.querySelector(
      'input[name="resume"]'
    ) as HTMLInputElement;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("message", message);
    formData.append("resume", fileInput.files![0]); // file

    const res = await fetch("http://localhost:3001/contact/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      showAlert("success", "Message & resume submitted!");
    } else {
      showAlert("error", "Upload failed");
    }

    setName("");
    setEmail("");
    setMessage("");
    setSelectedFile("Upload Resume");
  };

  const handleBack = () => {
    if (document.referrer && document.referrer !== window.location.href) {
      router.back(); // real browser back
    } else {
      router.push("/LandingPage"); // your landing page route
    }
  };
  return (
    <>
      {/* Alerts */}
      {alert.show && alert.type && (
        <AlertBox
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ show: false, type: null, message: "" })}
        />
      )}

      {/* PURPLE GRADIENT BACKGROUND */}
      <Box
        id="home"
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #ece6f3 0%, rgb(217, 212, 252) 100%)",
          pb: "4rem",
        }}
      >
        {/* HEADER INSIDE PAGE */}
        <Header />

        {/* CENTERED CONTENT */}
        <Box
          sx={{
            pt: "7rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            minHeight: "100vh",
          }}
        >
          {/* BACK BUTTON */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: {
                xs: "flex-start",
                md: "flex-start",
                lg: "flex-start",
              },
              pl: { xs: "1rem", sm: "2rem", md: "6rem", lg: "12rem" }, // smooth alignment
              mb: "1rem",
            }}
          >
            <button
              onClick={handleBack}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontSize: "1rem",
                fontWeight: 600,
                color: "black",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                textDecoration: "underline",
              }}
            >
              ← Back
            </button>
          </Box>

          {/* TITLE */}
          <Typography
            sx={{
              fontSize: { xs: "2rem", md: "4rem" },
              fontWeight: 600,
              color: "black",
              textAlign: "center",
              mb: "1rem",
            }}
          >
            First steps start here.
          </Typography>

          {/* SUBTITLE */}
          <Typography
            sx={{
              fontSize: { xs: "0.8rem", md: "1.3rem" },
              color: "gray",
              textAlign: "center",
              width: { xs: "90%", sm: "80%", md: "60%" },
              mb: "2rem",
            }}
          >
            Have questions, need help, or want to discover more about Anchor?
            We're here to support you every step of the way.
          </Typography>

          {/* RESPONSIVE CONTACT FORM */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: { xs: "90%", sm: "70%", md: "40%" },
              background: "white",
              p: "2rem",
              borderRadius: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {/* NAME */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                fontWeight: "bold",
                color: "black",
              }}
            >
              <span>
                Name <span style={{ color: "red" }}>*</span>
              </span>
              <input
                type="text"
                value={name}
                placeholder="User name"
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  marginTop: "0.5rem",
                  padding: "0.9rem",
                  borderRadius: "2rem",
                  background: "rgb(232,232,232)",
                  border: "none",
                  color: "black",
                  width: "100%",
                }}
              />
            </Box>

            {/* EMAIL */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                fontWeight: "bold",
                color: "black",
              }}
            >
              <span>
                Email <span style={{ color: "red" }}>*</span>
              </span>
              <input
                type="email"
                value={email}
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  marginTop: "0.5rem",
                  padding: "0.9rem",
                  borderRadius: "2rem",
                  background: "rgb(232,232,232)",
                  border: "none",
                  color: "black",
                  width: "100%",
                }}
              />
            </Box>

            {/* MESSAGE */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                fontWeight: "bold",
                color: "black",
              }}
            >
              <span>Message:</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Optional"
                style={{
                  marginTop: "0.7rem",
                  padding: "0.8rem",
                  borderRadius: "1rem",
                  background: "rgb(232,232,232)",
                  border: "none",
                  height: "5rem",
                  width: "100%",
                  color: "black",
                }}
              />
            </Box>

            {/* FILE UPLOAD */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span
                style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}
              >
                Tell us about yourself <span style={{ color: "red" }}>*</span>
              </span>

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  background:
                    "linear-gradient(90deg, #6b4bff 0%, #9d76ff 100%)",
                  color: "white",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(107,75,255,0.25)",
                }}
              >
                <Upload size={18} />

                {selectedFile}

                {selectedFile !== "Upload Resume" && (
                  <X
                    size={18}
                    style={{ marginLeft: "auto", cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile("Upload Resume");
                    }}
                  />
                )}

                <input
                  type="file"
                  name="resume"
                  accept=".pdf,.doc,.docx"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedFile(file.name);
                  }}
                />
              </label>
            </Box>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "2rem",
                border: "none",
                color: "white",
                fontWeight: "bold",
                fontSize: "large",
                cursor: "pointer",
                background: "linear-gradient(90deg, #f3d55b, #f1cf4b)",
                boxShadow: "0 5px 25px #5b3aff20, 0 0 40px #5b3aff20",
                transition: "all 0.25s ease",
              }}
            >
              Send Message
            </button>
          </Box>
        </Box>
      </Box>
    </>
  );
}
