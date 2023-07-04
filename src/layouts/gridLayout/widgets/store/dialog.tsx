import { Dialog, DialogProps } from "primereact/dialog";
import { FC, useContext } from "react";
import GridLayoutContext from "../../context";
import App from "../app";
import appConfig from "../app/config";

interface StoreDialogProps extends DialogProps {}

const StoreDialog: FC<StoreDialogProps> = (props) => {
  const { ...rest } = props;

  const { addItem } = useContext(GridLayoutContext);

  //   一些网站数据 icon url name
  const mockWebsite = [
    {
      icon: "https://www.baidu.com/favicon.ico",
      url: "https://www.baidu.com",
      name: "百度",
    },
    {
      name: "必应",
      url: "https://cn.bing.com/",
      icon: "https://cn.bing.com/favicon.ico",
    },
    {
      name: "谷歌",
      url: "https://www.google.com/",
      icon: "https://www.google.com/favicon.ico",
    },
    {
      name: "GitHub",
      url: "https://github.com",
      icon: "https://github.githubassets.com/favicon.ico",
    },
  ];

  return (
    <Dialog
      style={{ width: "50vw" }}
      breakpoints={{ "960px": "75vw", "641px": "100vw" }}
      {...rest}
    >
      <div className="grid grid-cols-10">
        {mockWebsite.map((i, j) => (
          <div
            className="relative"
            key={j}
            onClick={(e) => {
              e.stopPropagation();
              addItem({
                ...appConfig,
                dataSource: i,
                id: `item-${Math.floor(Math.random() * 100000)}`,
              });
            }}
          >
            <div className="absolute left-0 right-0 top-0 bottom-0"></div>
            <App dataSource={i} />
          </div>
        ))}
      </div>
    </Dialog>
  );
};

export default StoreDialog;
