// frontend/src/components/Common/Footer.jsx
import React from "react";
import styles from "./Common.module.css"; 

function Footer() {
  return (
    <footer className={styles.footer}>
      <p>
        &copy; {new Date().getFullYear()} Store Rating App. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
