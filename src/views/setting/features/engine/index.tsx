/*
 * @Author: Vir
 * @Date: 2022-01-05 15:04:44
 * @Last Modified by: Vir
 * @Last Modified time: 2022-02-03 17:14:05
 */
import {
  addClassifyApi,
  addEngineApi,
  addEngineData,
  delClassifyApi,
  editClassifyApi,
  FullSearchEngine,
  getEngineListApi,
  getClassifyApi,
  showClassifyApi,
  editEngineData,
  editEngineApi,
  delEngineApi,
  showEngineApi,
  getCurrentEngineApi,
} from '@/apis/engine';
import confirm from '@/components/md-custom/dialog/confirm';
import FormModal from '@/components/md-custom/formModal';
import Table from '@/components/md-custom/table';
import Tabs from '@/components/md-custom/tabs';
import engine from '@/data/engine';
import { SearchEngine, SearchEngineClassify } from '@/data/engine/types';
import ContentList from '@/pages/setting/components/contentList';
import ItemAccordion from '@/pages/setting/components/itemAccordion';
import ItemCard from '@/pages/setting/components/itemCard';
import { css } from '@emotion/css';
import { Button, Tooltip } from '@mui/material';
import { Empty } from 'antd';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Engine: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [classifyData, setClassifyData] = useState({} as any);
  const [engineData, setEngineData] = useState({} as any);
  const [openEngine, setOpenEngine] = useState(false);
  const [classifyList, setClassifyList] = useState<SearchEngineClassify[]>([]);
  const [engineList, setEngineList] = useState<FullSearchEngine[]>([]);
  const [currentEngine, setCurrentEngine] = useState<SearchEngine>({} as any);

  const getAllClassify = () => {
    getClassifyApi().then((res: any) => {
      setClassifyList(res);
    });
  };

  const addClassify = (val: any) => {
    addClassifyApi(val).then((res) => {
      setOpen(false);
      getAllClassify();
      enqueueSnackbar('添加分类成功', { variant: 'success' });
    });
  };

  const editClassify = (val: any) => {
    editClassifyApi(val).then((res) => {
      setOpen(false);
      setClassifyData({});
      getAllClassify();
      enqueueSnackbar('修改分类成功', { variant: 'success' });
    });
  };

  const delClassify = (id: string) => {
    confirm({
      type: 'warning',
      title: '提示',
      content: '确认删除该分类吗？',
      onOk: () => {
        delClassifyApi(id).then((res) => {
          getAllClassify();
          enqueueSnackbar('删除分类成功', { variant: 'success' });
        });
      },
    });
  };

  const showClassify = (id: string, isShow: boolean) => {
    showClassifyApi(id, isShow)
      .then((res) => {
        getAllClassify();
      })
      .catch((err) => {
        enqueueSnackbar(err, { variant: 'error' });
      });
  };

  const getEngineList = () => {
    getEngineListApi().then((res) => {
      setEngineList(res);
    });
  };

  const addEngine = (data: addEngineData) => {
    addEngineApi(data).then((res) => {
      setOpenEngine(false);
      setEngineData({});
      enqueueSnackbar('添加搜索引擎成功', { variant: 'success' });
      getEngineList();
    });
  };

  const editEngine = (data: editEngineData) => {
    editEngineApi(data).then((res) => {
      setOpenEngine(false);
      setEngineData({});
      enqueueSnackbar('修改搜索引擎成功', { variant: 'success' });
      getEngineList();
    });
  };

  const delEngine = (id: string) => {
    confirm({
      type: 'warning',
      title: '提示',
      content: '确认删除该搜索引擎？',
      onOk: () => {
        delEngineApi(id).then((res) => {
          enqueueSnackbar('删除搜索引擎成功', { variant: 'success' });
          getEngineList();
        });
      },
    });
  };

  const showEngine = (id: string, isShow: boolean) => {
    showEngineApi(id, isShow).then((res) => {
      getEngineList();
    });
  };

  const getCurrentEngine = () => {
    getCurrentEngineApi().then((res) => {
      setCurrentEngine(res);
    });
  };

  const columns = [
    { field: 'name', name: '搜索引擎' },
    { field: 'value', name: '关键字' },
    { field: 'href', name: 'URL' },
    {
      field: 'operate',
      name: '操作',
      render: (_: any, r: any) => {
        return (
          <>
            {!r.isDefault && (
              <Button
                size="small"
                color="error"
                onClick={() => delEngine(r._id)}
              >
                删除
              </Button>
            )}
          </>
        );
      },
    },
  ];

  // 初始化
  useEffect(() => {
    getAllClassify();
    getEngineList();
    getCurrentEngine();
  }, []);

  return (
    <div>
      <ContentList>
        <ItemAccordion
          title="全部分类"
          desc="设置搜索引擎分类，并可通过拖拽对分类排序"
          action={
            <Button
              size="small"
              disableElevation
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
            >
              添加分类
            </Button>
          }
        >
          <ContentList className="max-h-96 overflow-y-auto">
            {classifyList.length > 0 ? (
              classifyList.map((i) => (
                <ItemCard
                  size="small"
                  key={i._id}
                  title={i.name}
                  desc={i.description}
                  action={
                    <>
                      {!i.isDefault && (
                        <Button
                          onClick={() => {
                            setClassifyData(i);
                            setOpen(true);
                          }}
                          color="warning"
                        >
                          修改
                        </Button>
                      )}
                      {!i.isDefault && (
                        <Button
                          color="error"
                          onClick={() => delClassify(i._id)}
                        >
                          删除
                        </Button>
                      )}
                      {
                        <Button
                          color="info"
                          onClick={() => showClassify(i._id, !i.isShow)}
                        >
                          {i.isShow ? '隐藏' : '显示'}
                        </Button>
                      }
                    </>
                  }
                ></ItemCard>
              ))
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无分类"
              />
            )}
          </ContentList>
        </ItemAccordion>
        <ItemAccordion
          title="全部搜索引擎"
          action={
            <Button
              size="small"
              disableElevation
              onClick={(e) => {
                e.stopPropagation();
                setOpenEngine(true);
              }}
            >
              添加搜索引擎
            </Button>
          }
        >
          <ContentList className="max-h-96 overflow-y-auto">
            {engineList.length > 0 ? (
              engineList.map((i) => (
                <ItemCard
                  key={i._id}
                  title={i.name}
                  desc={i.href}
                  action={
                    <>
                      {!i.isDefault && (
                        <Button
                          onClick={() => {
                            const { classify, ...data } = i;
                            setEngineData({
                              ...data,
                              classifyId: classify?._id,
                            });
                            setOpenEngine(true);
                          }}
                          color="warning"
                        >
                          修改
                        </Button>
                      )}
                      {!i.isDefault &&
                        (function () {
                          const button = (
                            <Button
                              disabled={currentEngine?._id === i._id}
                              color="error"
                              onClick={() => delEngine(i._id)}
                            >
                              删除
                            </Button>
                          );
                          return currentEngine?._id === i._id ? (
                            <Tooltip title="使用中的搜索引擎无法删除" arrow>
                              <span>{button}</span>
                            </Tooltip>
                          ) : (
                            button
                          );
                        })()}
                      {
                        <Button
                          color="info"
                          onClick={() => showEngine(i._id, !i.isShow)}
                        >
                          {i.isShow ? '隐藏' : '显示'}
                        </Button>
                      }
                    </>
                  }
                  onClick={() => {
                    navigate(
                      `/setting/lab/search-engine/engine-detail/${i._id}`,
                    );
                  }}
                ></ItemCard>
              ))
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无搜索引擎"
              />
            )}
          </ContentList>
        </ItemAccordion>
      </ContentList>
      <FormModal
        open={open}
        title={classifyData._id ? '修改分类' : '新增分类'}
        value={classifyData}
        config={[
          {
            name: 'name',
            label: '名称',
            type: 'text',
            required: true,
          },
          {
            name: 'value',
            label: '简称',
            type: 'text',
          },
          {
            name: 'description',
            label: '描述',
            type: 'textArea',
          },
        ]}
        onOk={(val) => {
          classifyData?._id ? editClassify(val) : addClassify(val);
        }}
        onCancel={() => {
          setOpen(false);
          setClassifyData({});
        }}
      />
      <FormModal
        open={openEngine}
        title={engineData._id ? '修改搜索引擎' : '新增搜索引擎'}
        value={engineData}
        config={[
          {
            name: 'name',
            label: '名称',
            type: 'text',
            required: true,
          },
          {
            name: 'value',
            label: '简称',
            type: 'text',
          },
          {
            name: 'href',
            label: '网址',
            type: 'textArea',
            required: true,
          },
          {
            name: 'classifyId',
            label: '分类',
            type: 'select',
            required: true,
            fieldProps: {
              options: classifyList,
              optionsConfig: {
                label: 'name',
                value: '_id',
              },
            },
          },
          {
            name: 'description',
            label: '描述',
            type: 'textArea',
          },
        ]}
        onOk={(val) => {
          engineData?._id ? editEngine(val) : addEngine(val);
        }}
        onCancel={() => {
          setOpenEngine(false);
          setEngineData({});
        }}
      />
    </div>
  );
};

export default Engine;
