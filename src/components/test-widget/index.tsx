import React, { useEffect, useState } from 'react';
import { Button, Card, Typography } from 'antd';
import { RiHeartLine, RiHeartFill, RiRefreshLine } from '@remixicon/react';

const { Text } = Typography;

interface TestWidgetProps {
  mode?: 'icon' | 'full';
  onLike?: (count: number) => void;
}

const TestWidget: React.FC<TestWidgetProps> = ({ mode = 'full', onLike }) => {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  const handleLike = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    
    const newCount = isLiked ? likeCount - 1 : likeCount + 1;
    setLikeCount(newCount);
    setIsLiked(!isLiked);
    onLike?.(newCount);
  };

  const handleRefresh = () => {
    setCurrentTime(new Date());
  };

  // 图标模式 - 显示在桌面图标位置
  if (mode === 'icon') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg p-2">
        <div className="text-xs font-bold mb-1">
          {currentTime.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
        <div className="flex items-center gap-1">          <button
            onClick={handleLike}
            className="text-white hover:text-red-300 transition-colors"
            type="button"
          >
            {isLiked ? <RiHeartFill size={12} /> : <RiHeartLine size={12} />}
          </button>
          <Text className="text-xs text-white">{likeCount}</Text>
        </div>
      </div>
    );
  }

  // 完整模式 - 显示在独立窗口中
  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 min-h-full">
      <Card 
        title="测试小组件" 
        className="shadow-sm"
        extra={
          <Button 
            icon={<RiRefreshLine />} 
            onClick={handleRefresh}
            size="small"
          >
            刷新
          </Button>
        }
      >
        <div className="space-y-4">
          {/* 时钟显示 */}
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="text-2xl font-mono font-bold text-blue-600 mb-2">
              {currentTime.toLocaleTimeString('zh-CN')}
            </div>
            <Text type="secondary">
              {currentTime.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </Text>
          </div>

          {/* 点赞功能 */}
          <div className="text-center p-4 bg-white rounded-lg">
            <div className="mb-3">
              <Text strong>点赞功能测试</Text>
            </div>
            <Button
              type={isLiked ? 'primary' : 'default'}
              icon={isLiked ? <RiHeartFill /> : <RiHeartLine />}
              onClick={handleLike}
              size="large"
              className="mb-2"
            >
              {isLiked ? '已点赞' : '点赞'}
            </Button>
            <div>
              <Text type="secondary">总点赞数: {likeCount}</Text>
            </div>
          </div>

          {/* 功能说明 */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Text type="warning" className="text-sm">
              <strong>功能演示:</strong><br />
              • 桌面图标模式: 显示实时时钟和快速点赞<br />
              • 完整窗口模式: 显示详细信息和完整功能<br />
              • 支持在图标模式下进行简单交互
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TestWidget;
