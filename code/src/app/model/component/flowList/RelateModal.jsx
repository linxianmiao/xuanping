import React, { useEffect, useState } from 'react'
import { Modal, Input, Menu, Spin, Empty, Table, message, Tooltip } from '@uyun/components'
import moment from 'moment'
import './relateModal.less'

function RelateSubModal(props) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [groupId, setGroupId] = useState('all')
  const [tableData, setTableData] = useState([])
  const [groupData, setGroup] = useState([])
  const [tableLoading, setTableLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [selectedChildren, setSelectedChildren] = useState([])
  const [current, setCurrent] = useState(1)
  const [size, setTablePageSize] = useState(20)
  const [tableTotal, setTotal] = useState(1)

  const conditions = { page_num: 1, page_size: 100 }
  let total = 0
  let timer = null
  const columns = [
    {
      title: i18n('conf.model.field.card.name'),
      dataIndex: 'name'
    },
    {
      title: i18n('type'),
      dataIndex: 'classification',
      render: (text) => {
        const typeObj = data.find((d) => d.value === text)
        return typeObj?.name
      }
    },
    {
      title: i18n('conf.model.field.layoutId'),
      dataIndex: 'layoutId',
      render: (text) => {
        const groupObj = groupData.find((d) => d.id === text)
        return groupObj?.name
      }
    },
    {
      title: i18n('create_time'),
      dataIndex: 'createTime',
      render: (text) => (text ? moment(text).format('YYYY-MM-DD HH:mm') : '--')
    }
  ]

  const { visible, modelId, onCancel } = props

  const query = async () => {
    setLoading(true)

    const res = await axios.get(API.queryDictionaryData('model_type'), { params: conditions })
    const data2 = (res.pageNum > 1 ? data : []).concat(res.list || [])

    conditions.page_num = res.pageNum || 1
    total = res.total || 0
    setData(data2)
    setLoading(false)
  }

  const queryTable = async ({ id, index, pageSize }) => {
    setTableLoading(true)
    const params = {
      classification: id === 'all' ? undefined : groupId,
      pageNum: index,
      pageSize: pageSize,
      parentModelId: modelId
    }
    const res = await axios(API.getChildModalById, { params })
    setTotal(res?.total)
    setTableData(res?.list)
    setTableLoading(false)
  }

  const getModalroups = async () => {
    const res = await axios(API.query_model_layout, { params: { pageNo: 1, pageSize: 100 } })
    setGroup(res?.list)
  }

  useEffect(() => {
    let flag = true
    if (props.visible && flag) {
      query()
      getModalroups()
      queryTable({ id: groupId, index: current, pageSize: size })
    }
    return () => {
      flag = false
      setSelectedRowKeys([])
    }
  }, [props.visible])

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, offsetHeight } = e.target
    // 是否到达底部
    const isBottom = scrollTop + offsetHeight >= scrollHeight

    if (total > data.length && isBottom && !loading) {
      conditions.page_num = conditions.page_num + 1
      timer = setTimeout(() => {
        clearInterval(timer)
        query()
      }, 300)
    }
  }
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys, selectedRows) => {
      const selectList = _.map(selectedRows, (d) => ({
        childModelId: d.id,
        childModelName: d.name
      }))
      setSelectedChildren(selectList)
      setSelectedRowKeys(newSelectedRowKeys)
    }
  }

  const submit = async () => {
    const params = {
      currentModelId: modelId,
      childModels: selectedChildren
    }
    const res = await axios.post(API.relateChildModel, params)
    if (res === '200') {
      message.success(i18n('save_success', '保存成功'))
      props.query()
      onCancel()
    }
  }
  return (
    <Modal
      title={i18n('association_process')}
      visible={visible}
      className="relate-submodal"
      destroyOnClose
      onCancel={onCancel}
      onOk={submit}
    >
      <div className="relate-submodal-left">
        <div>{i18n('conf.model.modelType')}</div>
        <div>
          {/* <Input.Search placeholder={i18n('globe.keywords', '请输入关键字')} /> */}
          <Menu
            selectedKeys={[groupId]}
            onClick={(e) => {
              setGroupId(e.key)
              queryTable({ id: e.key, index: current, pageSize: size })
            }}
          >
            <Menu.Item key="all">{i18n('all')}</Menu.Item>
            {data.map((item) => (
              <Menu.Item key={item.value}>
                <Tooltip title={item.name}>{item.name}</Tooltip>
              </Menu.Item>
            ))}
          </Menu>
          {loading && <Spin />}
          {data.length === 0 && !loading && <Empty type="data" />}
        </div>
      </div>
      <div className="relate-submodal-right">
        <div>{i18n('create-definiton-server-time-week-all')}</div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={tableData}
          loading={tableLoading}
          rowSelection={rowSelection}
          pagination={{
            total: tableTotal,
            current: current,
            pageSize: size,
            onChange: (cur, si) => {
              setCurrent(cur)
              setTablePageSize(si)
              queryTable({ id: groupId, index: cur, pageSize: si })
            },
            onShowSizeChange: (cur, si) => {
              setCurrent(1)
              setTablePageSize(si)
            }
          }}
        />
      </div>
    </Modal>
  )
}

export default RelateSubModal
