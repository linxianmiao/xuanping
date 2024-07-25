import {
  AltForm as Form,
  Input,
  InputNumber,
  Popconfirm,
  Table,
  Typography,
  Button,
  message,
  Spin
} from '@uyun/components'
import React, { useState, useContext, useEffect } from 'react'
import { useDidMount } from '@uyun/hooks'
import uuid from '~/utils/uuid'
import RemoteSettingsStore from './remoteSettingsStore'
import './index.less'
import _ from 'lodash'

const remoteSettingsStore = new RemoteSettingsStore()

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0
          }}
          rules={[
            {
              required: true,
              validator: (rule, value, callback) => {
                if (!value) {
                  callback(`请输入${title}`)
                } else {
                  if (dataIndex === 'accessAddress') {
                    const urlVerify =
                      /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+$/
                    if (!urlVerify.test(value)) {
                      callback('访问地址格式不正确,例如:http://10.1.60.101/')
                    } else {
                      callback()
                    }
                  } else {
                    callback()
                  }
                }
              }
            }
          ]}
        >
          <Input
            placeholder={
              dataIndex === 'accessAddress' ? '输入格式:http://xxxxx/' : `请输入${title}`
            }
          />
        </Form.Item>
      ) : (
        children
      )}
    </td>
  )
}

const App = () => {
  const [form] = Form.useForm()
  const [data, setData] = useState([])
  const [editingKey, setEditingKey] = useState('')
  const isEditing = (record) => record.id === editingKey

  useEffect(() => {
    getList()
  }, [])

  const getList = async () => {
    const res = await remoteSettingsStore.remoteDockingList({ pageNum: 1, pageSize: 9999, kw: '' })
    setData(res.list)
  }
  const edit = (record) => {
    form.setFieldsValue({
      name: '',
      age: '',
      address: '',
      ...record
    })
    setEditingKey(record.id)
  }
  const save = async (record) => {
    try {
      const row = await form.validateFields()
      // 有id的数据走更新接口
      const edit = !_.isEmpty(record?.id)
      let data = row
      if (edit) {
        data = {
          id: record.id,
          ...row
        }
      }
      const res = edit
        ? await remoteSettingsStore.remoteDockingUpdate(data)
        : await remoteSettingsStore.remoteDockingSave(data)
      if (res === '200') {
        getList()
        message.success(edit ? '更新成功' : '保存成功')
      } else {
        message.error(edit ? '更新失败' : '保存失败')
      }
      setEditingKey('')
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo)
    }
  }
  const cancel = async (record) => {
    try {
      if (!record?.id) {
        setEditingKey('')
        getList()
        return
      }
      const row = await form.validateFields()
      setEditingKey('')
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo)
    }
  }

  const handleAdd = async () => {
    try {
      const row = await form.validateFields()
      const newData = {
        systemName: '',
        accessAddress: '',
        apiKey: ''
      }
      form.setFieldsValue({
        ...newData
      })
      setEditingKey(newData.key)
      setData([...data, newData])
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo)
    }
  }
  const handleDelete = async (id) => {
    const res = await remoteSettingsStore.remoteDockingDelete({ id })
    if (res === '200') {
      getList()
      message.success(i18n('del.sucess', '删除成功'))
    } else {
      message.error('删除失败')
    }
  }
  const columns = [
    {
      title: '系统名称',
      key: 'systemName',
      dataIndex: 'systemName',
      width: 300,
      editable: true
    },
    {
      title: '访问地址',
      key: 'accessAddress',
      dataIndex: 'accessAddress',
      width: 300,
      editable: true
    },
    {
      title: 'APIKey',
      key: 'apiKey',
      dataIndex: 'apiKey',
      width: 300,
      editable: true
    },
    {
      title: 'appkey',
      key: 'appkey',
      dataIndex: 'appkey',
      width: 300,
      editable: true
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 120,
      render: (_, record) => {
        const editable = isEditing(record)
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record)}
              style={{
                marginRight: 8
              }}
            >
              保存
            </Typography.Link>
            <Popconfirm
              title={i18n('ticket.forms.excel_cancel', '确认取消编辑？')}
              onConfirm={() => cancel(record)}
            >
              <a>取消</a>
            </Popconfirm>
          </span>
        ) : (
          <span>
            <Typography.Link
              disabled={editingKey !== ''}
              onClick={() => edit(record)}
              style={{
                marginRight: 8
              }}
            >
              编辑
            </Typography.Link>
            <Popconfirm
              title={i18n('conf.model.del.card', '确定要删除吗？')}
              onConfirm={() => handleDelete(record.id)}
            >
              <a disabled={editingKey !== ''}>删除</a>
            </Popconfirm>
          </span>
        )
      }
    }
  ]
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record)
      })
    }
  })

  return (
    <Spin spinning={remoteSettingsStore.queryLoading}>
      <Button
        onClick={handleAdd}
        type="primary"
        style={{
          marginBottom: 16
        }}
      >
        {i18n('add', '添加')}
      </Button>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell
            }
          }}
          dataSource={data}
          columns={mergedColumns}
          pagination={false}
        />
      </Form>
    </Spin>
  )
}
export default App
