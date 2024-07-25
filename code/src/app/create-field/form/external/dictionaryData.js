import React, { Component } from 'react'
import { Select } from '@uyun/components'

const Option = Select.Option

export default class DictionaryData extends Component {
  state = {
    dictList: []
  }

  componentDidMount() {
    this.queryDictList()
  }

  queryDictList = async (kw = '') => {
    const params = { dataMode: 1 }
    const res = await axios.get(API.queryDictionaryType(kw), { params }) || []

    this.setState({ dictList: res })
  }

  handleChange = code => {
    const { fieldData } = this.props
    fieldData.dictionarySource = code
    this.props.onChange(fieldData)
  }

  render() {
    const { fieldData } = this.props
    const { dictList } = this.state

    return (
      <div className="list-select-custom-options">
        <Select
          style={{ width: '180px' }}
          value={fieldData.dictionarySource}
          onChange={this.handleChange}
        >
          {
            dictList.map(item => (
              <Option key={item.code}>{item.name}</Option>
            ))
          }
        </Select>
      </div>
    )
  }
}
