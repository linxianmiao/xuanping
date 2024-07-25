import React, { Component } from 'react'
import { inject } from '@uyun/core'
import { Input } from '@uyun/components'
import ModelTypeLazySelect from '../ModelTypeSelect'
import styles from './index.module.less'

class Filters extends Component {
  @inject('i18n') i18n

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
      <div className={styles.mbtModelListFilters}>
        <Input.Search
          style={{ width: 194 }}
          placeholder={this.i18n('input_keyword', '请输入关键字')}
          allowClear
          enterButton
          value={kw}
          onChange={(e) => this.setState({ kw: e.target.value })}
          onSearch={this.handleSearch}
          onClear={() => this.setState({ kw: undefined }, () => this.handleSearch())}
        />
        <ModelTypeLazySelect
          value={classification}
          style={{ width: 194, marginLeft: 11 }}
          onChange={(value) => this.setState({ classification: value }, () => this.handleSearch())}
        />
      </div>
    )
  }
}

export default Filters
