import React, { Component } from 'react'
import { FileExcelOutlined } from '@uyun/icons'
import { Table, Upload, message, Select, Checkbox } from '@uyun/components'
import uuidv4 from 'uuid/v4'
const Option = Select.Option
const Dragger = Upload.Dragger

class ExcelColumn extends Component {
  state = {
    source: []
  }

  columns = [
    {
      title: i18n('col_name'),
      dataIndex: 'name'
    },
    {
      title: i18n('col_type'),
      dataIndex: 'type',
      render: (text, record) => (
        <Select value={text} onSelect={(value) => this.onSelectType(record.key, value)}>
          <Option value="default">默认</Option>
          <Option value="ip">IP</Option>
          <Option value="select">下拉</Option>
          <Option value="port">端口</Option>
        </Select>
      )
    },
    {
      title: i18n('col_data_source'),
      dataIndex: 'source',
      render: (text, record) => {
        if (record.type === 'select') {
          return (
            <Select value={text} onSelect={(value) => this.onSelectSource(record.key, value)}>
              {this.state.source.map((item) => (
                <Option value={item.code} key={item.code}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )
        }
        return i18n('field.none')
      }
    },
    {
      title: i18n('col_required'),
      dataIndex: 'required',
      render: (text, record) => (
        <Checkbox
          checked={text}
          onChange={(e) => this.onChangeRequired(record.key, e.target.checked)}
        />
      )
    }
  ]

  onSelectType = (key, type) => {
    const { value, onChange } = this.props
    const newData = [...value]
    const index = newData.findIndex((item) => key === item.key)
    if (onChange && index > -1) {
      newData.splice(index, 1, {
        ...newData[index],
        type,
        source: type === 'select' ? this.state.source[0].code : undefined
      })
      onChange(newData)
    }
  }

  onSelectSource = (key, source) => {
    const { value, onChange } = this.props
    const newData = [...value]
    const index = newData.findIndex((item) => key === item.key)
    if (onChange && index > -1) {
      newData.splice(index, 1, {
        ...newData[index],
        source
      })
      onChange(newData)
    }
  }

  onChangeRequired = (key, checked) => {
    const { value, onChange } = this.props
    const newData = [...value]
    const index = newData.findIndex((item) => key === item.key)
    if (onChange && index > -1) {
      newData.splice(index, 1, {
        ...newData[index],
        required: checked
      })
      onChange(newData)
    }
  }

  onUpload = (file) => {
    const { action, onChange } = this.props
    const formData = new FormData()

    formData.append('file', file, file.name)
    formData.append('fileName', file.name)

    axios.post(action, formData).then(
      (res) => {
        message.success(i18n('ticket.forms.excel_success', 'Excel 导入成功'))
        const data = res.map((name) => ({
          key: uuidv4(),
          name,
          type: 'default',
          source: undefined,
          required: false
        }))
        if (onChange) {
          onChange(data)
        }
      },
      (err) => {
        message.error(i18n('ticket.forms.excel_fail', 'Excel 导入失败'))
      }
    )

    return false
  }

  componentDidMount() {
    axios.get(API.query_field_with_type).then((res) => {
      this.setState({ source: res.listSel })
    })
  }

  render() {
    const { value } = this.props

    if (value) {
      return (
        <Table
          className="excel-import-table"
          size="small"
          columns={this.columns}
          dataSource={value}
          bordered
          pagination={false}
        />
      )
    }

    return (
      <Dragger beforeUpload={this.onUpload} showUploadList={false} className="excel-import-upload">
        <p className="excel-import-upload-icon">
          <FileExcelOutlined />
        </p>
        <p className="excel-import-upload-text">
          {i18n('ticket.create.drag_excel', '拖拽 Excel 文件到此区域')}
        </p>
      </Dragger>
    )
  }
}

export default ExcelColumn
