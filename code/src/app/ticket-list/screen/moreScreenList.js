import React, { Component } from 'react'
import { Button } from '@uyun/components'
import { screenList } from './config'
import { SingleRowText, MultiSel, ListSel, TimeData } from './component'
import './style/moreScreenList.less'

class MoreScreenList extends Component {
  render () {
    return (
      <div className={`screen-list ${this.props.isShow}`}>
        {
          screenList.map(data => {
            const dilver = {
              item: data,
              initValue: this.props.searchData[data.value],
              handleScreenData: this.props.handleScreenData
            }
            switch (data.type) {
              case 'singleRowText' :
                return <SingleRowText {...dilver} key={data.value} />
              case 'multiSel':
                return <MultiSel {...dilver} key={data.value} />
              case 'listSel':
                return <ListSel {...dilver} key={data.value} />
              case 'time':
                return <TimeData {...dilver} key={data.value} />
              default:
            }
          })
        }
        <div className="screen-btn-wrap">
          <div className="screen-btn-inner">
            <Button type="primary" onClick={() => { this.props.handleInquire() }}>{i18n('globe.search', '查询')}</Button>
            <Button type="primary" onClick={() => { this.props.handleReset() }} className="btn-reset">{i18n('globe.reset', '重置')}</Button>
          </div>
        </div>
      </div>
    )
  }
}

export default MoreScreenList
