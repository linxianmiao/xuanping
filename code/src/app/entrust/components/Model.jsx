import React, { Component } from 'react'
import { Select } from '@uyun/components'
import CreateTicket from '~/model-list/create-ticket'
const Option = Select.Option
export default class Models extends Component {
  state = {
    visible: false,
    models: []
  }

  handleChangeVisible = (visible, type) => {
    this.setState({ visible })
    if (visible) {
      this.handleChangeSelectList(this.props.value)
    }
    if (type === 'ok') {
      const { models } = this.state
      this.props.onChange(models)
    }
  }

  handleChangeSelectList = (models) => {
    this.setState({ models })
  }

  onChange = (ids) => {
    const { value } = this.props
    this.props.onChange(
      _.filter(value, item => item.type === 'model' ? _.includes(ids, item.processId) : _.includes(ids, item.id))
    )
  }

  render() {
    const { visible, models } = this.state
    const { value, disabled } = this.props
    const ids = _.map(value, item => item.type === 'model' ? item.processId : item.id)
    return (
      <React.Fragment>
        <Select
          disabled={disabled}
          allowClear
          mode="tags"
          open={false}
          value={ids}
          onChange={this.onChange}
          placeholder="请选择模型"
          onDropdownVisibleChange={() => { this.handleChangeVisible(true) }}
        >
          {_.map(value, item => {
            if (item.type === 'model') {
              return <Option key={item.processId} value={item.processId}>{item.processName}</Option>
            } else {
              return <Option key={item.id} value={item.id}>{item.name}</Option>
            }
          })}
        </Select>
        <CreateTicket
          mode="select"
          showFooter
          selectList={models}
          visible={visible}
          showFollow={false}
          handleChange={this.handleChangeVisible}
          handleChangeSelectList={this.handleChangeSelectList}
        />
      </React.Fragment>
    )
  }
}