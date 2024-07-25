import React, { Component } from 'react'
import LazySelect from '~/components/lazyLoad/lazySelect'
import { inject, observer } from 'mobx-react'
@inject('listStore')
@observer
class ModelSelect extends Component {
  static defaultProps = {
    authFilter: false // 是否需要权限过滤
  }

  state = {
    value: undefined
  }

  // 接口参数支持的几种类型
  paramFilterTypes = [
    'todo',
    'groupTodo',
    'all',
    'myCreate',
    'myFollow',
    'approve',
    'myPartIn',
    'archived',
    'todoGroup'
  ]

  getValues = async (props) => {
    const { value, mode } = props
    if (!_.isEmpty(value)) {
      const modelId = mode === 'multiple' ? value.toString() : value
      this.props.listStore.getModelsByIds(modelId).then((res) => {
        const value = _.map(res, (item) => ({ key: item.id, label: item.name }))
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
    const { authFilter, filterType } = this.props
    const { pageSize, pageNo, kw } = query
    const paramFilterType = this.getParamFilterType(filterType)

    let data = []

    if (this.paramFilterTypes.includes(paramFilterType)) {
      const params = { pageNo, pageSize, kw, filterType: paramFilterType }
      data = (await axios.get(API.queryTicketModelList, { params })) || []
    } else if (authFilter) {
      const params = { pageNo, pageSize, kw }
      const res = (await axios.get(API.queryAuthModelList, { params })) || {}
      data = _.map(res.list, (item) => ({ id: item.processId, name: item.processName }))
    } else {
      data = (await this.props.listStore.getModelList({ pageNum: pageNo, wd: kw, pageSize })) || []
      data = _.map(data, (item) => ({ id: item.id, name: item.name }))
    }

    callback(data)
  }

  getParamFilterType = (filterType) => {
    switch (filterType) {
      case 'myToDo':
      case 'batchMyTodo':
        return 'todo'
      case 'groupTodo':
      case 'batchGroupTodo':
        return 'groupTodo'
      case 'mycheck':
        return 'approve'
      case 'mycreate':
        return 'myCreate'
      case 'todoGroup':
      case 'batchTodoGroup':
        return 'todo_group'
      default:
        return filterType
    }
  }

  onChange = (value) => {
    this.setState({ value: value })
    if (_.isEmpty(value)) {
      this.props.onChange(undefined)
    } else {
      if (this.props.mode === 'multiple') {
        this.props.onChange(_.map(value, (item) => item.key))
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

export default ModelSelect
