"use client";
import React from "react";
import styles from "./AlertBox.module.css";
import { CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";

export interface AlertBoxProps {
  type?: "success" | "error" | "warning";
  message: string;
  onClose: () => void;
}

export default function AlertBox({
  type = "success",
  message,
  onClose,
}: AlertBoxProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} className={styles.successIcon} />;
      case "error":
        return <XCircle size={20} className={styles.errorIcon} />;
      case "warning":
        return <AlertTriangle size={20} className={styles.warningIcon} />;
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.alert} ${styles[type]}`}>
      <div className={styles.icon}>{getIcon()}</div>
      <p>{message}</p>
      <X size={18} className={styles.closeBtn} onClick={onClose} />
    </div>
  );
}
