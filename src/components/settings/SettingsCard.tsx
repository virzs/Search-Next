import { ReactNode } from "react";
import { Card } from "antd";
import { css } from "@emotion/css";

interface SettingsCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  bordered?: boolean;
  size?: "small" | "default" | "large";
  extra?: ReactNode;
  bodyStyle?: React.CSSProperties;
}

const SettingsCard = ({
  title,
  children,
  className = "",
  bordered = false,
  size = "default",
  extra,
  bodyStyle,
}: SettingsCardProps) => {
  const getPadding = () => {
    switch (size) {
      case "small":
        return "16px";
      case "large":
        return "32px";
      default:
        return "24px";
    }
  };

  const cardStyles = css`
    border-radius: 16px !important;
    border: ${bordered ? "1px solid #f0f0f0" : "none"} !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
    background: #ffffff !important;
    overflow: hidden !important;
    transition: all 0.3s ease !important;
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
    }
    
    .ant-card-head {
      border-bottom: 1px solid #f5f5f5 !important;
      padding: 20px ${getPadding()} 16px !important;
      min-height: auto !important;
      
      .ant-card-head-title {
        padding: 0 !important;
        font-size: 18px !important;
        font-weight: 600 !important;
        color: #171717 !important;
      }
      
      .ant-card-extra {
        padding: 0 !important;
      }
    }
    
    .ant-card-body {
      padding: ${title ? "20px" : "24px"} ${getPadding()} !important;
    }
    
    /* 移动端适配 */
    @media (max-width: 768px) {
      border-radius: 12px !important;
      
      .ant-card-head {
        padding: 16px 20px 12px !important;
        
        .ant-card-head-title {
          font-size: 16px !important;
        }
      }
      
      .ant-card-body {
        padding: ${title ? "16px" : "20px"} 20px !important;
      }
    }
  `;

  return (
    <Card
      title={title}
      extra={extra}
      bordered={false}
      className={`${cardStyles} ${className}`}
      bodyStyle={bodyStyle}
    >
      {children}
    </Card>
  );
};

export default SettingsCard;
