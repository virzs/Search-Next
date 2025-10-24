import { ReactNode } from "react";
import { Typography } from "antd";
import { css } from "@emotion/css";

const { Title, Paragraph } = Typography;

interface SettingsViewHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  extra?: ReactNode;
  centered?: boolean;
}

const SettingsViewHeader = ({
  title,
  description,
  icon,
  extra,
  centered = false,
}: SettingsViewHeaderProps) => {
  return (
    <div
      className={css`
        margin-bottom: 32px;
        text-align: ${centered ? "center" : "left"};
        
        @media (max-width: 768px) {
          margin-bottom: 24px;
        }
      `}
    >
      {/* 图标和标题区域 */}
      <div
        className={css`
          display: flex;
          align-items: center;
          justify-content: ${centered ? "center" : "space-between"};
          margin-bottom: ${description ? "12px" : "0"};
          gap: 12px;
        `}
      >
        <div
          className={css`
            display: flex;
            align-items: center;
            gap: 12px;
          `}
        >
          {icon && (
            <div
              className={css`
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-size: 18px;
                
                @media (max-width: 768px) {
                  width: 28px;
                  height: 28px;
                  font-size: 16px;
                }
              `}
            >
              {icon}
            </div>
          )}
          <Title
            level={2}
            className={css`
              margin: 0 !important;
              font-size: 28px !important;
              font-weight: 600 !important;
              color: #171717 !important;
              
              @media (max-width: 768px) {
                font-size: 24px !important;
              }
            `}
          >
            {title}
          </Title>
        </div>
        
        {extra && !centered && (
          <div
            className={css`
              flex-shrink: 0;
            `}
          >
            {extra}
          </div>
        )}
      </div>
      
      {/* 描述文本 */}
      {description && (
        <Paragraph
          type="secondary"
          className={css`
            margin: 0 !important;
            font-size: 16px !important;
            line-height: 1.5 !important;
            color: #666 !important;
            
            @media (max-width: 768px) {
              font-size: 14px !important;
            }
          `}
        >
          {description}
        </Paragraph>
      )}
      
      {/* 居中模式下的额外内容 */}
      {extra && centered && (
        <div
          className={css`
            margin-top: 16px;
            display: flex;
            justify-content: center;
          `}
        >
          {extra}
        </div>
      )}
    </div>
  );
};

export default SettingsViewHeader;