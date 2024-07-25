import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import LazySelect from '~/components/lazyLoad/lazySelect'

@inject('modelListStore')
@observer
export default class ModelList extends Component {
  state = {
    selectLabelInValue: null,
    ids: null
  }

  componentDidMount() {
    this.getValues(this.props.value)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.getValues(nextProps.value)
    }
  }

  componentDidUpdate(nextProps) {
    if (this.props.comparison !== nextProps.comparison) {
      this.setState({ selectLabelInValue: undefined })
    }
  }

  getValues = async (value) => {
    const { mode } = this.props
    if (!_.isEmpty(value)) {
      const modelId = mode === 'multiple' ? value.toString() : value
      const res = await this.props.modelListStore.getModelsByIds(modelId) || []
      const nextValue = _.map(res, item => ({ key: item.id, label: item.name }))
      this.setState({
        selectLabelInValue: mode === 'multiple' ? nextValue : nextValue[0]
      })
    }
  }

  getList = async (query, callback) => {
    const res = await this.props.modelListStore.getConfModelList(query) || {}
    const { list } = res
    callback(list)
  }

  onChange = (value) => {
    this.setState({ selectLabelInValue: value })
    if (_.isEmpty(value)) {
      this.props.handleChange(undefined)
    } else {
      if (this.props.mode === 'multiple') {
        this.props.handleChange(_.map(value, item => item.key))
      } else {
        this.props.handleChange(value.key)
      }
    }
  }

  render() {
    const { mode, disabled } = this.props
    const { selectLabelInValue } = this.state
    return (
      <LazySelect
        disabled={disabled}
        value={selectLabelInValue || undefined}
        labelInValue
        mode={mode}
        onChange={this.onChange}
        getList={this.getList}
        placeholder={i18n('pls_select_modelType', '请选择模型类型')}
      />
    )
  }
}
