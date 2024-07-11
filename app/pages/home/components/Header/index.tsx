import { Button } from "antd";
import { motion } from "framer-motion";
import { Link } from "next-view-transitions";
import { FC } from "react";

interface HeaderProps {}

const Header: FC<HeaderProps> = (props) => {
  return (
    <motion.header className="header py-4 px-8 w-full">
      <motion.div className="items-center justify-end flex max-w-7xl mx-auto gap-2">
        <Link href="/login">
          <Button>登录</Button>
        </Link>
        <Link href="/register">
          <Button type="primary">注册</Button>
        </Link>
      </motion.div>
    </motion.header>
  );
};

export default Header;
