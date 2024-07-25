import React, { Fragment } from 'react'
import { Modal, Button, Select, Input, Table } from '@uyun/components'
import { i18n as __, getRequestInstance } from '../utils'

const request = getRequestInstance('/automation/boltdog/api/v2')

class VersionSelect extends React.Component {
  static defaultProps = {
    value: {},
    onChange: () => {}
  }

  state = {
    data: []
  }

  query() {
    const { id, onChange } = this.props
    if (!id) {
      return this.setState({ data: [] })
    }
    request
      .get('/action/versions', {
        params: { id, includeDul: 0, exclude: '1,2,5,6' }
      })
      .then((data) => {
        this.setState({ data }, () => {
          if (data.length) {
            onChange(data[0])
          }
        })
      })
  }

  render() {
    const { value, disabled, onChange } = this.props
    const { data } = this.state
    return (
      <div style={{ width: 120 }}>
        <Select
          disabled={disabled}
          value={value}
          onSelect={(e) => {
            const item = data.find((i) => e == i.version)
            onChange(item)
          }}
        >
          {data.map((item) => {
            return (
              <Select.Option key={item.version} value={item.version + ''}>
                {item.title}
              </Select.Option>
            )
          })}
        </Select>
      </div>
    )
  }

  componentDidMount() {
    this.query()
  }
}

class Result extends React.Component {
  static defaultProps = {
    data: [],
    onChange: () => {}
  }

  handleVersionChange(info, action) {
    const { data, onChange } = this.props
    const newData = data.slice()
    const index = newData.findIndex((i) => i.id === action.id)
    newData[index].title = info.title
    newData[index].version = info.version
    newData[index].status = info.stageStatus
    onChange(newData)
  }

  handlePathChange(value, action) {
    const { data, onChange } = this.props
    const newData = data.slice()
    const index = newData.findIndex((i) => i.id === action.id)
    newData[index].distributePath = value
    onChange(newData)
  }

  handleDelete(id) {
    const { data, onChange } = this.props
    const newData = data.filter((i) => i.id !== id)
    onChange(newData)
  }

  render() {
    const { data, disabled } = this.props
    if (!data || data.length === 0) {
      return null
    }
    const columns = [
      { title: __('common.field.name'), dataIndex: 'name' },
      {
        title: __('common.version.number'),
        width: 120,
        render: (_, item) => {
          return disabled ? (
            item.title
          ) : (
            <VersionSelect
              id={item.id}
              disabled={disabled}
              value={item.version + ''}
              onChange={(value) => this.handleVersionChange(value, item)}
            />
          )
        }
      },
      {
        title: __('script.distribute.path'),
        width: 150,
        render: (_, item) => {
          return disabled ? (
            item.distributePath
          ) : (
            <Input
              disabled={disabled}
              placeholder={__('script.distribute.path.placehoder')}
              value={item.distributePath}
              onChange={(e) => this.handlePathChange(e.target.value, item)}
            />
          )
        }
      },
      {
        title: __('action'),
        width: 100,
        render: (_, item) => {
          return (
            <a disabled={disabled} onClick={() => this.handleDelete(item.id)}>
              {__('button.delete')}
            </a>
          )
        }
      }
    ]
    if (disabled) {
      columns.pop()
    }
    return (
      <div className="picker-select-result" style={{ marginTop: 10 }}>
        <Table
          size="small"
          rowKey="id"
          dataSource={JSON.parse(data)}
          columns={columns}
          pagination={false}
        />
      </div>
    )
  }
}

class ScriptPicker extends React.Component {
  static defaultProps = {
    value: [],
    disabled: false,
    onChange: () => {}
  }

  state = {
    visible: false,
    selected: this.props.value.slice(),
    data: [],
    loading: false,
    name: '',
    page: 1,
    total: 0
  }

  query() {
    const { name, page } = this.state
    this.setState({ loading: true })
    request
      .get('/action/simple/query', {
        params: {
          name,
          mode: 2,
          fromJobTime: true,
          currentPage: page,
          pageSize: 10
        }
      })
      .then((res) => {
        this.setState({ loading: false, ...res })
      })
  }

  submit(selected) {
    const { value, onChange } = this.props
    const newValue = selected.map((item) => {
      return value.find((i) => i.id === item.id) || item
    })
    this.setState({ visible: false }, () => onChange(newValue))
  }

  select(record, checked) {
    let { selected } = this.state
    if (checked) {
      selected = selected.concat(record)
    } else {
      selected = selected.filter((i) => i.id !== record.id)
    }
    selected = selected.map((i) => {
      return {
        id: i.id,
        name: i.name,
        distributePath: i.distributePath,
        version: i.version || 0,
        title: i.title || '',
        status: i.status || 0
      }
    })
    this.setState({ selected })
  }

  renderModal() {
    const { visible, loading, data, selected, name, page, total } = this.state
    const columns = [
      { title: __('script.field.name'), width: 300, dataIndex: 'name' },
      {
        title: __('script.field.classify'),
        dataIndex: 'classify',
        render: (classify) => classify.name
      }
    ]
    return (
      <Modal
        size="large"
        className="script-select-modal"
        visible={visible}
        title={__('script.select')}
        okButtonProps={{ disabled: loading || selected.length === 0 }}
        onCancel={() => this.setState({ visible: false })}
        onOk={() => this.submit(selected)}
      >
        <div className="au-data-search" style={{ marginBottom: 10 }}>
          <Input.Search
            placeholder={__('common.placeholder.key')}
            value={name}
            enterButton
            onChange={(e) => this.setState({ name: e.target.value })}
            onSearch={(e) => this.query()}
          />
        </div>
        <Table
          rowKey="id"
          dataSource={data}
          loading={loading}
          columns={columns}
          scroll={{ y: 300 }}
          rowSelection={{
            selectedRowKeys: JSON.parse(selected).map((i) => i.id),
            onSelect: (record, selected) => this.select(record, selected)
          }}
          pagination={{
            total,
            current: page,
            showQuickJumper: false,
            showSizeChanger: false,
            onChange: (page) => this.setState({ page }, () => this.query())
          }}
        />
      </Modal>
    )
  }

  render() {
    const { visible, selected } = this.state
    const { value, disabled, onChange } = this.props
    return (
      <div className="auto-script-picker">
        {disabled ? null : (
          <div className="picker-select-button">
            <Button
              disabled={disabled}
              type="primary"
              onClick={() => this.setState({ visible: !visible }, () => this.query())}
            >
              {__('script.select')}
            </Button>
          </div>
        )}
        <Result
          disabled={disabled}
          data={value}
          onChange={(val) => this.setState({ selected: val }, () => onChange(val))}
        />
        {this.renderModal()}
      </div>
    )
  }

  componentWillReceiveProps({ value }) {
    this.setState({ selected: value.slice() })
  }

  componentDidMount() {
    // this.query();
  }
}

export default ScriptPicker
