import React, { Component } from 'react'
import { MinusOutlined, PlusOutlined } from '@uyun/icons';
import { Table, Button, Input, Form, Select, Modal } from '@uyun/components'
import uuidv4 from 'uuid/v4'

const { Option } = Select

const portReg = /^(tcp|udp): ([0-9,]+)(&(\d{1,2})h)?$/

function getDataFromPort (value) {
  if (value) {
    return value.split(',\n').map(portString => {
      let protocol = 'tcp'
      let port = ''
      let time = '1'
      let error = false
      const matched = portString.match(portReg)
      if (matched) {
        protocol = matched[1]
        if (protocol === 'tcp') {
          port = matched[2]
          time = matched[4]
        } else if (protocol === 'udp') {
          port = matched[2]
          time = '1'
        }
        if (!validatePorts(port)) {
          error = true
        }
      } else {
        port = portString
        error = true
      }
      return {
        key: uuidv4(),
        protocol,
        port,
        time,
        error
      }
    })
  }
  return [{
    key: uuidv4(),
    protocol: 'tcp',
    port: '',
    time: '1',
    error: false
  }]
}

function getPortFromData (data) {
  return data.map(({ protocol, port, time }) => {
    if (protocol === 'tcp') {
      return `${protocol}: ${port}&${time}h`
    } else if (protocol === 'udp') {
      return `${protocol}: ${port}`
    }
    return ''
  }).join(',\n')
}

function validatePorts (value) {
  return value.split(',').every(port => port !== '' && port >= 0 && port <= 65535)
}

class Port extends Component {
  columns = [
    {
      title: '序号',
      key: 'index',
      width: 50,
      render: (text, record, index) => index + 1
    },
    {
      title: '协议',
      dataIndex: 'protocol',
      render: (protocol, record) => (
        <Select value={protocol} onSelect={value => this.onPortChange(record.key, value, 'protocol')}>
          <Option value="tcp">TCP</Option>
          <Option value="udp">UDP</Option>
        </Select>
      )
    },
    {
      title: '源端口',
      key: 'sourcePort',
      width: 125,
      render: () => (
        <Input disabled value="0-65535" />
      )
    },
    {
      title: '目的端口',
      dataIndex: 'port',
      width: 200,
      render: (port, record) => (
        <Form.Item style={{ marginBottom: 0 }} validateStatus={record.error ? 'error' : undefined}>
          <Input value={port} onChange={e => this.onPortChange(record.key, e.target.value, 'port')} />
        </Form.Item>
      )
    },
    {
      title: '长连接时间(h)',
      dataIndex: 'time',
      width: 110,
      render: (time, record) => (
        <Select value={time} disabled={record.protocol === 'udp'} onSelect={value => this.onPortChange(record.key, value, 'time')}>
          {_.range(24).map(i => (
            <Option key={i} value={`${i + 1}`}>{i + 1}</Option>
          ))}
        </Select>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (record) => (
        <div>
          <Button icon={<PlusOutlined />} style={{ marginRight: 8 }} onClick={() => this.onAdd(record.key)} />
          <Button icon={<MinusOutlined />} type="danger" onClick={() => this.onRemove(record.key)} />
        </div>
      )
    }
  ]

  constructor(props) {
    super(props)

    this.state = {
      value: props.value,
      data: getDataFromPort(props.value)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.value || nextProps.value !== this.state.value) {
      this.setState({
        value: nextProps.value,
        data: getDataFromPort(nextProps.value)
      })
    }
  }

  onPortChange = (key, value, title) => {
    const newData = [...this.state.data]
    const index = newData.findIndex(item => key === item.key)
    if (index > -1) {
      newData[index][title] = value
      if (title === 'port' && validatePorts(value)) {
        newData[index].error = false
      }
      this.setState({
        data: newData
      })
    }
  }

  onAdd = (key) => {
    const newData = [...this.state.data]
    const index = newData.findIndex(item => key === item.key)
    if (index > -1) {
      newData.splice(index + 1, 0, {
        key: uuidv4(),
        protocol: 'tcp',
        port: '',
        time: '1',
        error: false
      })
      this.setState({
        data: newData
      })
    }
  }

  onRemove = (key) => {
    if (this.state.data.length > 1) {
      const newData = [...this.state.data]
      const index = newData.findIndex(item => key === item.key)
      if (index > -1) {
        newData.splice(index, 1)
        this.setState({
          data: newData
        })
      }
    }
  }

  onOk = (e) => {
    const { data } = this.state
    const { onOk, onClose } = this.props
    let hasError = false

    const newData = this.state.data.map(item => {
      if (validatePorts(item.port)) {
        item.error = false
      } else {
        item.error = true
        hasError = true
      }
      return item
    })

    this.setState({
      data: newData
    }, () => {
      if (!hasError) {
        if (onOk) {
          onOk(getPortFromData(data))
        }
        if (onClose) {
          onClose(e)
        }
      }
    })
  }

  render() {
    const {
      visible
    } = this.props
    return (
      <Modal
        title="端口"
        visible={visible}
        width={600}
        size="small"
        onOk={this.onOk}
        onCancel={this.props.onClose}
      >
        <Table
          rowKey="key"
          size="small"
          bordered
          columns={this.columns}
          dataSource={this.state.data}
          pagination={false}
        />
      </Modal>
    )
  }
}

export default Port