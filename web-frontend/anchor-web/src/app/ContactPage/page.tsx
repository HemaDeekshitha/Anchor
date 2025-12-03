"use client";
import React, { use, useState } from "react";
import styles from "./Contact.module.css";
import Header from "../LandingPage/Header/Header";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import AlertBox, { AlertBoxProps } from "../Components/AlertBox/AlertBox";
import { s } from "framer-motion/client";
import { Box, Typography } from "@mui/material";
import Image from "next/image";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState("Upload Resume");
  const [fileLoading, setFileLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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

    setUploading(true);

    const fileInput = document.querySelector(
      'input[name="resume"]'
    ) as HTMLInputElement;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("message", message);
    formData.append("resume", fileInput.files![0]);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json().catch(() => ({}));
      // ^ prevent frontend crash if backend sends HTML or empty body

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          "Something went wrong. Please try again.";

        showAlert("error", msg);
        setUploading(false);
        return;
      }

      // SUCCESS
      showAlert("success", data?.message || "Message & resume submitted!");
    } catch (err) {
      console.error(err);
      showAlert("error", "Server is not responding. Please try again later.");
    }
    setUploading(false);
    setName("");
    setEmail("");
    setMessage("");
    setSelectedFile("Upload Resume");
  };

  const handleBack = () => {
    router.push("/LandingPage"); // your landing page route
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
          background: "linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(229, 38, 38, 0.85) 180%)",
          pb: "4rem",
        }}
      >
        {/* HEADER INSIDE PAGE */}
        {/* <Header /> */}
        <Box
          sx={{
            pt: "1.5rem",
            pl: { md: "1rem" },
            display: "flex",
            gap: "0.5rem",
            alignItems: { xs: "center", md: "center" },
            justifyContent: { xs: "center", md: "flex-start" },
          }}
        >
          <a href="/LandingPage">
            <Image
              src="/assets/logo.png"
              alt="Anchor Logo"
              width={50}
              height={50}
              style={{
                borderRadius: "15px",
                cursor: "pointer",
              }}
            />
          </a>
          <Typography
            sx={{
              color: "black",
              fontSize: "1.5rem",
              fontWeight: "Bold",
              cursor: "pointer",
            }}
            onClick={() => router.push("/LandingPage")}
          >
            Anchor
          </Typography>
        </Box>

        {/* CENTERED CONTENT */}
        <Box
          sx={{
            
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            minHeight: "80vh",
            
          }}
        >
          {/* BACK BUTTON */}

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
            Get in touch with us.
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
              width: { xs: "90%", sm: "70%", md: "25%" },
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
                placeholder="What’s holding you back right now?"
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
                      "linear-gradient(to right, rgba(209, 51, 51, 0.5), rgba(229, 181, 38, 0.5))",
                    backdropFilter: "blur(50px)",
                    WebkitBackdropFilter: "blur(12px)",
                  color: "white",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(107,75,255,0.25)",
                }}
              >
                <Upload size={18} />

                {/* {selectedFile} */}
                {fileLoading ? "Loading..." : selectedFile}

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
                  // onChange={(e) => {
                  //   const file = e.target.files?.[0];
                  //   if (file) setSelectedFile(file.name);
                  // }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    setFileLoading(true); // show Loading...

                    // small delay to simulate read process (UX smoothness)
                    await new Promise((res) => setTimeout(res, 600));

                    setSelectedFile(file.name); // show file name
                    setFileLoading(false); // stop loading
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
              {uploading ? "Uploading..." : "Send Message"}
            </button>
          </Box>
        </Box>
        
      </Box>
       
    </>
    
  );
}
