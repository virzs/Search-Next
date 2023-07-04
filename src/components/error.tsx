import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";

export interface Params {
  status: string;
}

export interface ErrorList {
  [key: string]: {
    title: string;
    desc: string;
  };
}

const ErrorView = () => {
  const navigate = useNavigate();
  const params = useParams();

  const errList: ErrorList = {
    "401": {
      title: "Premission Denied",
      desc: "Please check the account type.",
    },
    "404": {
      title: "Page not found",
      desc: "Please check the URL for typos or missing slashes.",
    },
  };

  const { status = "404" } = params as unknown as Params;

  const data = useMemo(() => {
    const d = errList[status] ?? errList["404"];
    return d;
  }, [status]);

  return (
    <div className="flex justify-center items-center flex-col h-full gap-4 select-none">
      <div className="flex gap-4">
        <h1 className="text-6xl font-bold text-red-500 pb-4">{status}</h1>
        <div className="border-l-2 border-gray-100 border-solid pl-4">
          <p className="text-4xl font-bold mb-2">{data.title}</p>
          <p>{data.desc}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-5">
        <Button
          onClick={() => {
            navigate(-1);
          }}
        >
          返回上一页
        </Button>
        <Button
          onClick={() => {
            navigate("/");
          }}
        >
          返回首页
        </Button>
      </div>
    </div>
  );
};

export default ErrorView;
