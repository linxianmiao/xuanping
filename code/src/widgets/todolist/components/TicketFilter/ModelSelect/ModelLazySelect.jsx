import React, { Component } from 'react'
import LazySelect from './LazySelect'
import { observer } from 'mobx-react'
import { inject } from '@uyun/core'

@observer
export default class ModelSelect extends Component {
  @inject('listStore') listStore
  state = {
    value: undefined
  }

  getValues = async props => {
    const { value, mode } = props
    if (!_.isEmpty(value)) {
      const modelId = mode === 'multiple' ? value.toString() : value
      this.listStore.getModelsByIds(modelId).then(res => {
        const value = _.map(res, item => ({ key: item.id, label: item.name }))
        if (mode === 'multiple') {
          this.setState({ value })
        } else {
          this.setState({ value: value[0] })
        }
      })
    }
  }

  componentDidMount() {
    this.getValues(this.props)
  }

  getList = async (query, callback) => {
    const { pageSize, pageNo, kw } = query
    let res = await this.listStore.getModelList({ pageNum: pageNo, wd: kw, pageSize }) || []
    res = _.map(res, item => ({ id: item.id, name: item.name }))
    callback(res)
  }

  onChange = value => {
    this.setState({ value: value })
    if (_.isEmpty(value)) {
      this.props.onChange(undefined)
    } else {
      if (this.props.mode === 'multiple') {
        this.props.onChange(_.map(value, item => item.key))
      } else {
        this.props.onChange(value.key)
      }
    }
  }

  render() {
    const value = this.props.value ? this.state.value : undefined
    return (
      <LazySelect
        {...this.props}
        value={value}
        labelInValue
        onChange={this.onChange}
        placeholder={`${i18n('globe.select', '请选择')}${i18n('sla_ticket_type', '工单类型')}`}
        getList={this.getList}
      />
    )
  }
}
