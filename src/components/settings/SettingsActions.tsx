import { ReactNode } from "react";
import { Button, Space } from "antd";
import { css } from "@emotion/css";

interface ActionButton {
  key: string;
  label: string;
  type?: "primary" | "default" | "dashed" | "link" | "text";
  icon?: ReactNode;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  danger?: boolean;
  size?: "small" | "middle" | "large";
}

interface SettingsActionsProps {
  actions: ActionButton[];
  layout?: "horizontal" | "vertical";
  align?: "left" | "center" | "right";
  size?: "small" | "middle" | "large";
  className?: string;
}

const SettingsActions = ({
  actions,
  layout = "horizontal",
  align = "left",
  size = "middle",
  className = "",
}: SettingsActionsProps) => {
  const containerStyles = css`
    display: flex;
    justify-content: ${align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center"};
    
    .ant-space {
      width: ${layout === "vertical" ? "100%" : "auto"};
    }
    
    .ant-btn {
      border-radius: 8px !important;
      font-weight: 500 !important;
      transition: all 0.3s ease !important;
      
      &.ant-btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        border: none !important;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3) !important;
        
        &:hover {
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
          transform: translateY(-1px) !important;
        }
        
        &:active {
          transform: translateY(0) !important;
        }
      }
      
      &.ant-btn-default {
        border-color: #e0e0e0 !important;
        
        &:hover {
          border-color: #667eea !important;
          color: #667eea !important;
          transform: translateY(-1px) !important;
        }
      }
      
      &.ant-btn-text {
        &:hover {
          background: rgba(102, 126, 234, 0.1) !important;
          color: #667eea !important;
        }
      }
      
      &.ant-btn-dangerous {
        &.ant-btn-primary {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%) !important;
          box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3) !important;
          
          &:hover {
            box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4) !important;
          }
        }
        
        &.ant-btn-default {
          border-color: #ff6b6b !important;
          color: #ff6b6b !important;
          
          &:hover {
            background: rgba(255, 107, 107, 0.1) !important;
          }
        }
      }
    }
    
    /* 移动端适配 */
    @media (max-width: 768px) {
      .ant-space {
        width: 100%;
      }
      
      .ant-btn {
        flex: ${layout === "vertical" ? "none" : "1"};
        min-width: ${layout === "horizontal" ? "0" : "auto"};
      }
    }
  `;

  return (
    <div className={`${containerStyles} ${className}`}>
      <Space
        direction={layout === "vertical" ? "vertical" : "horizontal"}
        size={layout === "vertical" ? "middle" : "small"}
        wrap={layout === "horizontal"}
      >
        {actions.map((action) => (
          <Button
            key={action.key}
            type={action.type || "default"}
            icon={action.icon}
            onClick={action.onClick}
            loading={action.loading}
            disabled={action.disabled}
            danger={action.danger}
            size={action.size || size}
            block={layout === "vertical"}
          >
            {action.label}
          </Button>
        ))}
      </Space>
    </div>
  );
};

export default SettingsActions;