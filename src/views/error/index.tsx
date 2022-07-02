import { Button } from '@mui/material';
import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export interface Params {
  status: string;
}

function Error() {
  const history = useNavigate();
  const params = useParams();

  const errList: any = {
    '401': {
      title: 'Premission Denied',
      desc: 'Please check the account type.',
    },
    '404': {
      title: 'Page not found',
      desc: 'Please check the URL for typos or missing slashes.',
    },
  };

  const { status = '404' } = params as unknown as Params;

  const data = useMemo(() => {
    const d = errList[status] as any;
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
          variant="outlined"
          onClick={() => {
            history(-1);
          }}
        >
          返回上一页
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            history('/');
          }}
        >
          返回首页
        </Button>
      </div>
    </div>
  );
}

export default Error;
