import React, { Component } from 'react'
import { PlusOutlined } from '@uyun/icons'
import {
  Table,
  Button,
  Popconfirm,
  Input,
  InputNumber,
  Upload,
  message,
  Form,
  Select,
  Modal
} from '@uyun/components'
import uuidv4 from 'uuid/v4'
import Port from './Port'

const { Option } = Select

export const ipReg =
  /^(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)(\/\d{2})?$/

function EditableCell(props) {
  const { editing, value, onChange, validateStatus } = props

  return (
    <div className={validateStatus ? 'ticket-forms-excel-table-error' : ''}>
      {editing ? (
        <Input
          style={{ margin: '-5px 0' }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        value
      )}
    </div>
  )
}

class ExcelTable extends Component {
  constructor(props) {
    super(props)

    this.cacheData = props.value.map((item) => ({ ...item }))

    this.columns = props.columns.map(({ name: title, type, required }) => ({
      title: required ? (
        <div className="ticket-forms-excel-table-required-column">{title}</div>
      ) : (
        title
      ),
      dataIndex: title,
      width: 300,
      render: this.renderCell(title, type)
    }))

    this.columnTypes = props.columns.reduce((types, column) => {
      types[column.name] = column
      return types
    }, {})

    if (!props.disabled) {
      this.columns.push(this.actionsColumn)
    }

    this.state = {
      editingKey: '',
      portVisible: false,
      portValue: '',
      portKey: '',
      portTitle: ''
    }
  }

  actionsColumn = {
    title: i18n('globe.opera', '操作'),
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: (record) => {
      const editing = this.isEditing(record)
      return editing ? (
        <div>
          <a onClick={() => this.save(record.key, record)} style={{ marginRight: 8 }}>
            {i18n('save', '保存')}
          </a>
          <Popconfirm
            title={i18n('ticket.forms.excel_cancel', '确认取消编辑？')}
            onConfirm={() => this.cancel(record.key)}
          >
            <a>{i18n('cancel', '取消')}</a>
          </Popconfirm>
        </div>
      ) : (
        <div>
          <a
            disabled={this.state.editingKey !== ''}
            style={{ marginRight: 8 }}
            onClick={() => this.edit(record.key)}
          >
            {i18n('edit', '编辑')}
          </a>
          <Popconfirm
            title={i18n('ticket.forms.excel_delete', '确认删除数据？')}
            onConfirm={() => this.remove(record.key)}
          >
            <a disabled={this.state.editingKey !== ''}>{i18n('delete', '删除')}</a>
          </Popconfirm>
        </div>
      )
    }
  }

  renderCell = (title, type) => (text, record) => {
    const editing = this.isEditing(record)
    const { type, source, required } = this.columnTypes[title]
    const invalid = this.validate(type, required, text)

    switch (type) {
      case 'select':
        const fieldOptions = this.props.fieldLists[source] || []
        const currentData = _.filter(fieldOptions, (opt) => opt.value === text)[0] || {}
        return (
          <div className={invalid ? 'ticket-forms-excel-table-error' : ''}>
            {editing ? (
              <Select
                defaultValue={text}
                onSelect={(value) => this.change(value, record.key, title)}
              >
                {fieldOptions.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            ) : (
              currentData.label
            )}
          </div>
        )

      case 'port':
        return (
          <a
            onClick={(e) => {
              e.preventDefault()
              this.setState({
                portVisible: true,
                portValue: text,
                portKey: record.key,
                portTitle: title
              })
            }}
          >
            {text
              ? text.split('\n').map((port) => <div>{port}</div>)
              : i18n('ticket.forms.excel_port', '点击输入')}
          </a>
        )

      default:
        return (
          <EditableCell
            editing={editing}
            value={text}
            validateStatus={invalid ? 'error' : ''}
            onChange={(value) => this.change(value, record.key, title)}
          />
        )
    }
  }

  isEditing = (record) => record.key === this.state.editingKey

  validate = (type, required, value = '') => {
    if (required && !value) {
      return true
    }
    switch (type) {
      case 'ip':
        return value.split(',').some((ip) => !ipReg.test(ip))
      default:
        return false
    }
  }

  emit = (data) => {
    const { onChange } = this.props
    if (onChange) {
      onChange(data)
    }
  }

  change = (value, key, column) => {
    const newData = [...this.props.value]
    const index = newData.findIndex((item) => key === item.key)
    if (index > -1) {
      newData[index][column] = value
      this.emit(newData)
    }
  }

  cancel = (key) => {
    const newData = [...this.props.value]
    const index = newData.findIndex((item) => key === item.key)
    if (index > -1) {
      if (this.cacheData[index]) {
        newData.splice(index, 1, this.cacheData[index])
      } else {
        newData.splice(index, 1)
      }
      this.setState({
        editingKey: ''
      })
      this.emit(newData)
    }
  }

  save = (key, record) => {
    const newData = [...this.props.value]
    this.setState({ editingKey: '' })
    this.cacheData = newData.map((item) => ({ ...item }))
  }

  edit = (key) => {
    this.setState({
      editingKey: key
    })
  }

  remove = (key) => {
    const newData = [...this.props.value]
    const index = newData.findIndex((item) => key === item.key)
    if (index > -1) {
      newData.splice(index, 1)
      this.setState({ editingKey: '' })
      this.emit(newData)
      this.cacheData = newData.map((item) => ({ ...item }))
    }
  }

  add = () => {
    const newData = [...this.props.value]
    const editingKey = uuidv4()
    const newDatum = this.props.columns.reduce(
      (data, { name }) => {
        data[name] = ''
        return data
      },
      { key: editingKey }
    )
    newData.push(newDatum)
    this.setState({
      editingKey
    })
    this.emit(newData)
  }

  onUpload = (file) => {
    const { uploadAction } = this.props
    const formData = new FormData()

    formData.append('file', file, file.name)
    formData.append('fileName', file.name)

    axios.post(uploadAction, formData).then(
      (res) => {
        message.success(i18n('ticket.forms.excel_success', 'Excel 导入成功'))
        const newData = res.map((item) => ({
          key: uuidv4(),
          ...item
        }))
        this.emit(newData)
      },
      () => {
        message.error(i18n('ticket.forms.excel_fail', 'Excel 导入失败'))
      }
    )

    return false
  }

  handlePortOk = (value) => {
    const { portKey, portTitle } = this.state

    this.change(value, portKey, portTitle)
    this.handlePortClose()
  }

  handlePortClose = () => {
    this.setState({
      portVisible: false
    })
    setTimeout(() => {
      this.setState({
        portValue: ''
      })
    }, 300)
  }

  render() {
    const { disabled, value, id, columns, downloadAction } = this.props
    const { portValue, portVisible } = this.state
    return (
      <div className="ticket-forms-excel-table">
        {!disabled && (
          <div className="clearfix ticket-forms-excel-table-actions">
            <div style={{ float: 'right' }}>
              <Button
                onClick={() =>
                  window.open(`${downloadAction}?column=${columns.map(({ name }) => name).join()}`)
                }
              >
                {i18n('ticket.forms.excel_download', '下载模板')}
              </Button>
              <Upload style={{ display: 'inline-block' }} beforeUpload={this.onUpload}>
                <Button disabled={this.state.editingKey !== ''}>
                  {i18n('ticket.forms.excel_import', '导入')}
                </Button>
              </Upload>
              <Button
                disabled={this.state.editingKey !== ''}
                icon={<PlusOutlined />}
                onClick={this.add}
              />
            </div>
          </div>
        )}
        <Table
          id={id}
          rowKey="key"
          size="small"
          bordered
          scroll={{ x: 920 }}
          style={{ marginBottom: 8 }}
          columns={this.columns}
          dataSource={value}
          pagination={false}
        />
        <Port
          visible={portVisible}
          value={portValue}
          onOk={this.handlePortOk}
          onClose={this.handlePortClose}
        />
      </div>
    )
  }
}

export default ExcelTable
