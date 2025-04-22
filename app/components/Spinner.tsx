import React from "react";
import { BeatLoader } from "react-spinners";

const Spinner = () => {
  return (
    <div className="spinner-container" style={styles.spinnerContainer}>
      <BeatLoader loading={true} size={20} color="#1d4f5d" />
    </div>
  );
};

// Add custom styles for the spinner container if needed
const styles = {
  spinnerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
  },
};

export default Spinner;
