import React, { Component } from 'react'
import { Input } from '@uyun/components'
import ModelTypeLazySelect from '~/components/ModelTypeSelect/LazySelect'

class Filters extends Component {
  state = {
    kw: undefined,
    classification: undefined
  }

  componentDidUpdate(prevProps) {
    const { groupId } = this.props

    if (groupId && groupId !== prevProps.groupId) {
      this.setState({
        kw: undefined,
        classification: undefined
      })
    }
  }

  handleChange = (value, field) => {
    this.setState({ [field]: value })
  }

  handleSearch = () => {
    this.props.onChange({ ...this.state })
  }

  render() {
    const { kw, classification } = this.state

    return (
      <div className="mbt-model-list-filters">
        <Input.Search
          style={{ width: 214 }}
          placeholder={i18n('input_keyword')}
          allowClear
          enterButton
          value={kw}
          onChange={(e) => this.setState({ kw: e.target.value })}
          onSearch={this.handleSearch}
          onClear={() => this.setState({ kw: undefined }, () => this.handleSearch())}
        />
        <ModelTypeLazySelect
          value={classification}
          style={{ width: 214, marginLeft: 11 }}
          onChange={(value) => this.setState({ classification: value }, () => this.handleSearch())}
        />
      </div>
    )
  }
}

export default Filters
