"use client";
import React, { use, useState } from "react";
import styles from "./Contact.module.css";
import Header from "../LandingPage/Header/Header";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const isFormValid =
    name.trim() !== "" && email.trim() !== "" && message.trim() !== "";

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const res = await fetch("http://localhost:3001/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });

    if (res.ok) {
      alert("Message sent!");
    }
  };

  return (
    <>
      <Header />
      <div id="home" className={styles.ContactPageContainer}>
        <div className={styles.ContactPageMain}>
          <div className={styles.ContactPageContent}>
            <h1 className={styles.title}>First steps start here.</h1>
            <p className={styles.subtitle}>
              Have questions, need help, or want to discover more about Anchor?
              We're here to support you every step of the way.
            </p>
            <form className={styles.contactForm} onSubmit={handleSubmit}>
              <label className={styles.label}>
                Name:
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
                Email:
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
