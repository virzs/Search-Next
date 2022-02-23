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
  getAccountEngineApi,
  setAccountEngineApi,
  SearchEngineData,
} from '@/apis/engine';
import { BorderCard } from '@/components/global/card/styleCard';
import ItemHeader from '@/components/layout/menu-layout/itemHeader';
import confirm from '@/components/md-custom/dialog/confirm';
import Select from '@/components/md-custom/form/select';
import FormModal from '@/components/md-custom/formModal';
import { Engine as AccountEngine } from '@/data/account/interface';
import { SearchEngineClassify } from '@/data/engine/types';
import ContentList from '@/pages/setting/components/contentList';
import ItemAccordion from '@/pages/setting/components/itemAccordion';
import ItemCard from '@/pages/setting/components/itemCard';
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
  const [currentEngine, setCurrentEngine] = useState<FullSearchEngine>(
    {} as FullSearchEngine,
  );
  const [accountEngineData, setAccountEngineData] = useState({
    mode: 'default',
    indexCount: 4,
    sortType: 'default',
  } as AccountEngine);

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

  // 获取搜索引擎相关设置信息
  const getAccountEngine = () => {
    getAccountEngineApi().then((res) => {
      [res.mode, res.indexCount, res.sortType].some((i) => i !== undefined) &&
        setAccountEngineData(res);
      res.selected && res.selected !== ''
        ? setCurrentEngine(res.engine)
        : setCurrentEngine(
            engineList.find((i) => i.isSelected) || ({} as FullSearchEngine),
          );
    });
  };

  const handleChange = (val: any, type: 'mode' | 'indexCount' | 'sortType') => {
    const { mode, indexCount, sortType, selected } = accountEngineData;
    let newData = {
      mode,
      indexCount,
      sortType,
      selected: selected || currentEngine?._id,
    } as any;
    newData[type] = val;
    setAccountEngineApi(newData).then((res) => {
      getAccountEngine();
    });
  };

  useEffect(() => {
    engineList.length &&
      Object.keys(currentEngine).length === 0 &&
      getAccountEngine();
  }, [engineList]);

  // 初始化
  useEffect(() => {
    getAllClassify();
    getEngineList();
  }, []);

  return (
    <div>
      <ContentList>
        <BorderCard>
          <div className="p-2 px-4">
            <ItemHeader title="当前使用" />
            <p>名称: {currentEngine.name}</p>
            <p>URL: {currentEngine.href}</p>
            <p>使用次数: {currentEngine.count}</p>
          </div>
        </BorderCard>
        <ItemHeader title="基础设置" />
        <ItemCard
          title="模式"
          desc="设置搜索引擎模式"
          action={
            <Select
              size="small"
              label="模式"
              options={[
                { label: '基础', value: 'default' },
                { label: '高级', value: 'custom' },
              ]}
              value={accountEngineData.mode}
              onChange={(e) => handleChange(e.target.value, 'mode')}
            />
          }
        />
        <ItemCard
          title="搜索引擎显示数量"
          desc="设置搜索引擎在首页显示的数量"
          action={
            <Select
              label="数量"
              size="small"
              options={Array.from(new Array(6).keys())
                .slice(1)
                .map((i) => ({ label: i.toString(), value: i }))}
              value={accountEngineData.indexCount}
              onChange={(e) => handleChange(e.target.value, 'indexCount')}
            />
          }
        />
        <ItemCard
          title="排序方式"
          desc="设置首页搜索引擎排序方式"
          action={
            <Select
              size="small"
              label="排序方式"
              options={[
                { label: '默认', value: 'default' },
                { label: '按使用次数', value: 'count' },
              ]}
              value={accountEngineData.sortType}
              onChange={(e) => handleChange(e.target.value, 'sortType')}
            />
          }
        />
        <ItemHeader title="高级设置" />
        <ItemAccordion
          title="全部分类"
          desc="设置搜索引擎分类"
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
          desc="设置搜索引擎"
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
