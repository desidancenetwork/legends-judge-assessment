import React from 'react';
import styles from '../styles/DynamicGradient.module.css';

const DynamicGradient: React.FC = () => {
  return (
    <div className={styles.gradientContainer}>
      <div className={styles.gradientBlob1}></div>
      <div className={styles.gradientBlob2}></div>
      <div className={styles.gradientBlob3}></div>
      <div className={styles.gradientOverlay}></div>
    </div>
  );
};

export default React.memo(DynamicGradient);