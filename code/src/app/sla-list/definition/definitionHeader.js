import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Input, Checkbox } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import { renderPriority } from '../common'

@inject('definitionStore')
@withRouter
@observer
class DefinitionHeader extends Component {
    handleChange = (value, field) => {
      this.props.definitionStore[field] = value
    }

    handleSearch = () => {
      this.props.definitionStore.getSLACount()
      this.props.definitionStore.getSlaDefinitionList()
    }

    render () {
      const { priorityList, checkedList, kw } = this.props.definitionStore
      const options = [
        { label: `${renderPriority(5)}（${priorityList[4]}）`, value: '5' },
        { label: `${renderPriority(4)}（${priorityList[3]}）`, value: '4' },
        { label: `${renderPriority(3)}（${priorityList[2]}）`, value: '3' },
        { label: `${renderPriority(2)}（${priorityList[1]}）`, value: '2' },
        { label: `${renderPriority(1)}（${priorityList[0]}）`, value: '1' }
      ]

      return (
        <div className="sla-header-wrap">
          <Input.Search
            placeholder={i18n('globe.keywords', '请输入关键字')}
            value={kw}
            allowClear
            style={{ width: 256 }}
            onChange={e => this.handleChange(e.target.value, 'kw')}
            onSearch={() => this.handleSearch()}
            onClear={() => this.handleSearch()}
           />
          <Checkbox.Group
            className="check_bg"
            value={checkedList}
            style={{ paddingLeft: 20, float: 'right' }}
            options={options}
            onChange={value => {
              this.handleChange(value, 'checkedList')
              this.handleSearch()
            }}
          />
        </div>
      )
    }
}

export default DefinitionHeader
