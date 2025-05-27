"use client";

import { Button } from "antd";
import { motion } from "framer-motion";
import { FC } from "react";
import { Link } from "react-router";

const Header: FC = () => {
  return (
    <motion.header className="header py-4 px-8 w-full">
      <motion.div className="items-center justify-end flex max-w-7xl mx-auto gap-2">
        <Link to="/login" viewTransition>
          <Button>登录</Button>
        </Link>
        <Link to="/register" viewTransition>
          <Button type="primary">注册</Button>
        </Link>
      </motion.div>
    </motion.header>
  );
};

export default Header;
