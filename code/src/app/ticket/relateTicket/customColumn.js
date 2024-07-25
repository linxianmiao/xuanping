import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import { Button, message } from '@uyun/components'
import AttrFieldPanelModal from '~/components/AttrFieldPanel'
@inject('ticketStore')
@observer
class CustomColumn extends Component {
  handleChangeAttrField = (value) => {
    const valueCode = value.map((item) => item.code)
    if (valueCode.length === 0) {
      message.info('定制列至少保留一项')
      return
    }
    this.props.ticketStore.setSelectedList(value, 'RELATE')
    this.props.ticketStore.setRelateAttributeList(valueCode)
  }

  render() {
    const { columnAttrListRelate, columnSelectedListRelate } = this.props.ticketStore

    return (
      <AttrFieldPanelModal
        title={'定制列'}
        attrList={toJS(columnAttrListRelate)}
        selected={[...toJS(columnSelectedListRelate)]}
        modelIds={this.props.ticketViewModelId}
        onChange={(value) => this.handleChangeAttrField(value)}
      >
        <Button className="customized-columns">
          <i className="iconfont icon-filter-column" />
        </Button>
      </AttrFieldPanelModal>
    )
  }
}
export default CustomColumn
