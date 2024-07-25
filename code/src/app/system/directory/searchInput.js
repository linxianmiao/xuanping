import React from 'react'
import { Select } from '@uyun/components'
import { inject, observer } from 'mobx-react'
const Option = Select.Option
@inject('directoryStore')
@observer
class SearchInput extends React.Component {
  state = {
    data: []
  }

  handleSearch = (value) => {
    this.timer && clearInterval(this.timer)
    this.timer = setTimeout(() => {
      this.props.directoryStore.searchKw(value).then((resp) => {
        this.setState({
          data: resp.list || []
        })
      })
    }, 500)
  }

  handleChange = (value) => {
    this.props.directoryStore.setKw(value)
  }

  render() {
    const { kw } = this.props.directoryStore
    const options = this.state.data.map((d) => (
      <Option value={d.name} key={d.id}>
        {d.name}
      </Option>
    ))
    return (
      <Select
        allowClear
        showSearch
        value={kw}
        placeholder={this.props.placeholder}
        style={this.props.style}
        defaultActiveFirstOption={false}
        showArrow={false}
        filterOption={false}
        onSearch={this.handleSearch}
        onChange={this.handleChange}
        notFoundContent={null}
        id="dir_search_input"
      >
        {options}
      </Select>
    )
  }
}

export default SearchInput
