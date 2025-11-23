"use client";
import React, { use, useState } from "react";
import styles from "./Contact.module.css";
import Header from "../LandingPage/Header/Header";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import AlertBox, { AlertBoxProps } from "../Components/AlertBox/AlertBox";
import { s } from "framer-motion/client";

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

  // const handleSubmit = async (e: any) => {
  //   e.preventDefault(); // 👈 Fix form refresh
  //   setName("");
  //   setEmail("");
  //   setMessage("");
  //   setSelectedFile("Upload Resume");

  //   if (selectedFile === "Upload Resume") {
  //     showAlert("warning", "Please upload your resume.");
  //     return;
  //   }

  //   const res = await fetch("http://localhost:3001/contact", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ name, email, message }),
  //   });

  //   if (res.ok) {
  //     showAlert("success", "Your message has been sent successfully!");
  //   } else {
  //     showAlert("error", "Something went wrong. Please try again.");
  //   }
  // };

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
      {alert.show && alert.type && (
        <AlertBox
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ show: false, type: null, message: "" })}
        />
      )}

      <Header />

      <div id="home" className={styles.ContactPageContainer}>
        <div className={styles.ContactPageMain}>
          <div className={styles.ContactPageContent}>
            <div className={styles.backButtonContainer}>
              <button className={styles.backButton} onClick={handleBack}>
                &larr; Back
              </button>
            </div>
            <h1 className={styles.title}>First steps start here.</h1>
            <p className={styles.subtitle}>
              Have questions, need help, or want to discover more about Anchor?
              We're here to support you every step of the way.
            </p>
            <form className={styles.contactForm} onSubmit={handleSubmit}>
              <label className={styles.label}>
                <span>
                  Name <span className={styles.required}>*</span>
                </span>
                <input
                  type="text"
                  name="name"
                  className={styles.input}
                  placeholder="User name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
              <label className={styles.label}>
                <span>
                  Email <span className={styles.required}>*</span>
                </span>
                <input
                  type="email"
                  name="email"
                  className={styles.input}
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className={styles.label}>
                Message:
                <textarea
                  name="message"
                  className={styles.textarea}
                  placeholder="Optional"
                />
              </label>
              <label className={styles.labelWrapper}>
                <span className={styles.labelText}>
                  Tell us about yourself{" "}
                  <span className={styles.required}>*</span>
                </span>

                <label className={styles.customFileUpload}>
                  <Upload size={18} className={styles.iconLeft} />

                  {selectedFile}

                  {selectedFile !== "Upload Resume" && (
                    <X
                      size={18}
                      className={styles.iconRight}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile("Upload Resume");
                      }}
                    />
                  )}

                  <input
                    type="file"
                    name="resume"
                    className={styles.hiddenFileInput}
                    // required
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setSelectedFile(file.name);
                    }}
                  />
                </label>
              </label>

              <button type="submit" className={styles.submitButton}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
