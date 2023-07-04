import { FC } from "react";

interface AppProps {
  dataSource: {
    name: string;
    url: string;
    icon: string;
  };
}

const App: FC<AppProps> = (props) => {
  const { dataSource } = props;

  return (
    <a
      className="flex justify-center items-center flex-col h-full"
      href={dataSource.url}
    >
      <img className="w-12 h-12" src={dataSource.icon} alt="" />
      <p>{dataSource.name}</p>
    </a>
  );
};

export default App;
