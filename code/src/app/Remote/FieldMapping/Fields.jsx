import React, { Component } from 'react'
import { Menu, Input, Empty } from '@uyun/components'
import { getAvailableFieldTypes } from './logic'

class Fields extends Component {
  static defaultProps = {
    listStyle: {},
    title: '',
    type: 'par', // 'par'父流程字段，'sub'子流程字段
    mappingList: [],
    otherSelected: [], // 对照的字段列表选中项，对子流程字段组件来说，这就是父流程字段的选中项
    data: [],
    selected: [],
    onSelect: () => {}
  }

  state = {
    text: undefined
  }

  handleSelect = ({ key }) => {
    const { data, selected, onSelect } = this.props
    const existed = selected.some(item => item.code === key)

    if (existed) {
      onSelect([])
    } else {
      const item = data.find(d => d.code === key)

      if (item) {
        onSelect([item])
      }
    }
  }

  handleFilter = e => {
    this.setState({ text: e.target.value })
  }

  renderList = () => {
    const { mappingList, otherSelected, data, type } = this.props
    const { text } = this.state
    let nextData = []

    // 过滤已映射的
    data.forEach(item => {
      if (!mappingList.some(m => m[`${type}FieldCode`] === item.code)) {
        nextData.push(item)
      }
    })

    // 过滤关键字
    if (text) {
      nextData = nextData.filter(item => {
        return item.name.toLowerCase().indexOf(text.toLowerCase()) > -1
      })
    }

    return nextData.map(item => {
      let disabled = false

      if (otherSelected.length > 0) {
        const availabeTypes = getAvailableFieldTypes(otherSelected[0].type)

        if (!availabeTypes.includes(item.type)) {
          disabled = true
        }
      }

      return (
        <Menu.Item
          key={item.code}
          disabled={disabled}
          title={item.name}
        >
          {item.name}
        </Menu.Item>
      )
    })
  }

  render() {
    const { title, selected, listStyle } = this.props
    const { text } = this.state
    const selectedKeys = selected.map(item => item.code)
    const List = this.renderList()

    return (
      <div className="u4-transfer-list" style={listStyle}>
        <div className="u4-transfer-list-header">
          {title}
          <span className="u4-transfer-list-header-selected">
            {List.length || 0}
          </span>
        </div>
        <div className="u4-transfer-list-body u4-transfer-list-body-with-search">
          <div className="u4-transfer-list-body-search-wrapper">
            <Input.Search
              placeholder={i18n('input_keyword')}
              allowClear
              value={text}
              onChange={this.handleFilter}
            />
          </div>
          <Menu selectedKeys={selectedKeys} onClick={this.handleSelect}>
            {List.length > 0 ? List : <Empty type="table" />}
          </Menu>
        </div>
      </div>
    )
  }
}

export default Fields
