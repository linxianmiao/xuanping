import React, { Component } from 'react'
import { Select } from '@uyun/components'

const Option = Select.Option

class SelectIndex extends Component {
  state = {
    data: [],
    scrollPage: 1,
    total: 0
  }

  query = (pageNo = 1) => {
    const params = {
      pageNo,
      pageSize: 15
    }
    axios.get(API.queryFormLayouts, { params }).then(res => {
      const data = (res.pageNum > 1 ? this.state.data : []).concat(res.list || [])
      this.setState({ data, total: res.total, scrollPage: pageNo })
    })
  }

  onPopupScroll = e => {
    e.persist()
    const { target } = e
    const { data, total } = this.state
    if ((target.scrollTop + target.offsetHeight === target.scrollHeight) && data.length < total) {
      const { scrollPage } = this.state
      const nextScrollPage = scrollPage + 1
      this.query(nextScrollPage)
    }
  }

  onDropdownVisibleChange = status => {
    if (status) {
      this.query()
    }
  }

  render() {
    const { style, placeholder, onSelect, ...args } = this.props
    return (
      <Select
        {...args}
        style={style}
        placeholder={placeholder}
        // onFocus={this.query}
        onSelect={onSelect}
        onPopupScroll={this.onPopupScroll}
        onDropdownVisibleChange={this.onDropdownVisibleChange}
        allowClear
        onClear={e => onSelect()}
        labelInValue
      >
        {
          _.map(this.state.data, item => (
            <Option code={item.code} sort={item.sort} version={item.version} key={item.id} value={item.id}>{item.name}</Option>
          ))
        }
      </Select>
    )
  }
}

export default SelectIndex
