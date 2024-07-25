import React, { Component } from 'react'
import LazySelect from '~/components/lazyLoad/lazySelect'
import { inject, observer } from 'mobx-react'
@inject('listStore', 'globalStore')
@observer
export default class ModelSelect extends Component {
  state = {
    value: undefined
  }

  getValues = async () => {
    const { value, mode } = this.props
    if (!_.isEmpty(value)) {
      const modelId = mode === 'multiple' ? value.toString() : value
      this.props.listStore.getModelsByIds(modelId).then(res => {
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
    this.getValues()
  }

  getList = async(query, callback) => {
    const { pageSize, pageNo, kw } = query
    let res = await this.props.listStore.getModelList({ pageNum: pageNo, wd: kw, pageSize }) || []
    res = _.map(res, item => ({ id: item.id, name: item.name }))
    callback(res)
  }

  onChange = (value) => {
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
    const { value } = this.state
    return (
      <LazySelect
        {...this.props}
        size="default"
        value={value}
        labelInValue
        onChange={this.onChange}
        placeholder={i18n('pls_select_modelType', '请选择模型类型')}
        getList={this.getList} />
    )
  }
}