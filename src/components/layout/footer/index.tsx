import { FC } from "react";
import ThemeButton from "../../theme-button";

const Footer: FC = () => {
  return (
    <footer className="footer w-full py-4 px-8">
      <div className="max-w-7xl mx-auto flex items-center gap-4 justify-between">
        <p className="text-sm text-gray-500">© 2024</p>
        <ThemeButton />
      </div>
    </footer>
  );
};

export default Footer;
