import React, { Component } from 'react'
import { Cascader } from '@uyun/components'

class CascaderOwn extends Component {
  render () {
    return (
      <div>
        <Cascader
          allowClear
          changeOnSelect
          placeholder={i18n('ticket.list.screen.select', '请选择')}

        />
      </div>
    )
  }
}

export default CascaderOwn
