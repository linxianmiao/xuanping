import React, { Component } from 'react'
import { Checkbox, Input, Empty } from '@uyun/components'
import { getMappingFieldsCheckAllInfo } from './logic'

class MappingFields extends Component {
  static defaultProps = {
    listStyle: {},
    data: [],
    selected: [],
    onSelect: () => {}
  }

  state = {
    data: _.cloneDeep(this.props.data),
    text: undefined,
    indeterminate: false,
    isCheckAll: false
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data.length !== this.props.data.length) {
      this.handleFilter(this.state.text)
    }
    if (prevProps.selected.length > 0 && this.props.selected.length === 0) {
      this.handleCheckAll(false)
    }
  }

  handleFilter = text => {
    const { data, selected } = this.props
    let nextData = _.cloneDeep(data)

    if (text) {
      nextData = nextData.filter(item => {
        return (item.parFieldName + item.subFieldName).toLowerCase().indexOf(text.toLowerCase()) > -1
      })
    }

    const { indeterminate, isCheckAll } = getMappingFieldsCheckAllInfo(nextData, selected)

    this.setState({
      text,
      data: nextData,
      indeterminate,
      isCheckAll
    })
  }

  handleCheckAll = checked => {
    const { onSelect } = this.props
    const { data } = this.state

    if (data.length === 0) {
      return
    }

    const nextSelected = checked ? data : []

    this.setState({
      indeterminate: false,
      isCheckAll: checked
    })

    onSelect(nextSelected)
  }

  handleCheck = (checked, item) => {
    const { selected, onSelect } = this.props
    const { data } = this.state
    let nextSelected = _.cloneDeep(selected)

    if (checked) {
      nextSelected.push(_.cloneDeep(item))
    } else {
      nextSelected = nextSelected.filter(ns => ns.parFieldCode !== item.parFieldCode || ns.subFieldCode !== item.subFieldCode)
    }

    const { indeterminate, isCheckAll } = getMappingFieldsCheckAllInfo(data, nextSelected)

    this.setState({
      indeterminate,
      isCheckAll
    })
    onSelect(nextSelected)
  }

  renderList = () => {
    const { selected } = this.props
    const { data } = this.state

    return data.map(item => {
      const checked = selected.some(s => s.parFieldCode === item.parFieldCode && s.subFieldCode === item.subFieldCode)
      const title = `${item.parFieldName} - ${item.subFieldName}`
      return (
        <li
          key={item.parFieldCode + item.subFieldCode}
          className="u4-transfer-list-content-item"
        >
          <Checkbox checked={checked} onChange={e => this.handleCheck(e.target.checked, item)} />
          <span title={title}>{title}</span>
        </li>
      )
    })
  }

  render() {
    const { listStyle } = this.props
    const { indeterminate, isCheckAll, text, data } = this.state
    const List = this.renderList()

    return (
      <div className="u4-transfer-list" style={listStyle}>
        <div className="u4-transfer-list-header">
          <Checkbox
            indeterminate={indeterminate}
            checked={isCheckAll}
            onChange={e => this.handleCheckAll(e.target.checked)}
          />
          {i18n('mapped.field.list')}
          <span className="u4-transfer-list-header-selected">
            {data.length || 0}
          </span>
        </div>
        <div className="u4-transfer-list-body u4-transfer-list-body-with-search">
          <div className="u4-transfer-list-body-search-wrapper">
            <Input.Search
              placeholder={i18n('input_keyword')}
              allowClear
              value={text}
              onChange={e => this.handleFilter(e.target.value)}
            />
          </div>
          <ul className="u4-transfer-list-content">
            {List.length > 0 ? List : <Empty type="table" />}
          </ul>
        </div>
      </div>
    )
  }
}

export default MappingFields
