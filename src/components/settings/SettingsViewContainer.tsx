import { ReactNode } from "react";
import { motion } from "framer-motion";
import { css } from "@emotion/css";

interface SettingsViewContainerProps {
  children: ReactNode;
  className?: string;
}

const SettingsViewContainer = ({ children, className = "" }: SettingsViewContainerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex-1 overflow-auto ${className}`}
    >
      <div
        className={css`
          padding: 0;
          max-width: 100%;
          
          /* iPadOS风格的间距 */
          & > * + * {
            margin-top: 24px;
          }
          
          /* 响应式设计 */
          @media (max-width: 768px) {
            padding: 0 16px;
            
            & > * + * {
              margin-top: 16px;
            }
          }
        `}
      >
        {children}
      </div>
    </motion.div>
  );
};

export default SettingsViewContainer;