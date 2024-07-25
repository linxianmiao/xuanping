import React, { Component } from 'react'
import { Radio } from '@uyun/components'

class Header extends Component {
  render () {
    const { tab, openType, mode } = this.props
    // openType 的判断未看懂不修改之前逻辑，通过mode来控制header展示，当在委托时只显示工单
    return (
      <Radio.Group className="create-tickets-sloth-wrap" onChange={e => {
        this.props.handleChangeTab(e.target.value)
      }} value={tab} buttonStyle="solid">
        {
          mode === 'link'
            ? <React.Fragment>
              {openType[0] === '1' && openType[1] === '1' && <Radio.Button value="tabA">{i18n('layout.select_process', '工单')}</Radio.Button>}
              {openType[0] === '1' && openType[1] === '1' && <Radio.Button value="tabB">{ i18n('service.catlog')}</Radio.Button>}
            </React.Fragment>
            : <Radio.Button value="tabA">{i18n('layout.select_process', '工单')}</Radio.Button>
        }
      </Radio.Group>
    )
  }
}

export default Header
