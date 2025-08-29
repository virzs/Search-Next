import React, { useState, useCallback } from "react";
import SearchComponent from "../search";
import AISearchModal from "./ai-search";

const SearchWithAI: React.FC = () => {
  const [showAISearch, setShowAISearch] = useState(false);

  const handleAISearchClick = useCallback(() => {
    setShowAISearch(true);
  }, []);

  const handleAISearchClose = useCallback(() => {
    setShowAISearch(false);
  }, []);

  return (
    <>
      {/* 普通搜索组件 */}
      <SearchComponent onAISearchClick={handleAISearchClick} showAIButton={true} />

      {/* AI搜索模态框 */}
      {showAISearch && <AISearchModal visible={showAISearch} onClose={handleAISearchClose} />}
    </>
  );
};

export default SearchWithAI;
