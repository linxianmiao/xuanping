import React, { Component, createRef } from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { FilterOutlined } from '@uyun/icons'
import { Button, message } from '@uyun/components'
import { inject } from '@uyun/core'
import { defaultColumnList } from '../../config'
import AttrFieldPanelModal from '~/components/AttrFieldPanel'
import { TicketlistStore } from '../../ticketlist.store'

@observer
class CustomColumn extends Component {
  @inject(TicketlistStore) listStore
  @inject('i18n') i18n

  sortable = null
  wrapperRef = createRef()

  handleChange = ({ value, checked }) => {
    const { checkedColumnCodes } = this.listStore
    let newCodes
    if (checked) {
      newCodes = [...checkedColumnCodes, value]
    } else {
      newCodes = checkedColumnCodes.filter((code) => code !== value)
    }
    this.listStore.setProps({ checkedColumnCodes: newCodes })
  }

  setCheckedCodes = (codes) => {
    this.listStore.setProps({ checkedColumnCodes: codes })
  }

  handleChangeAttrField = async (value) => {
    const valueCode = value.map((item) => item.code)
    if (valueCode.length === 0) {
      message.info('定制列至少保留一项')
      return
    }
    await this.listStore.setSelectedList(value, 'COLUMN')
    await this.listStore.setProps({ checkedColumnCodes: valueCode })
    this.listStore.getTicketFormData()
  }

  render() {
    const { columnSelectedList } = this.listStore
    return (
      <AttrFieldPanelModal
        title={'定制列'}
        attrList={defaultColumnList}
        selected={[...toJS(columnSelectedList)]}
        onChange={(value) => this.handleChangeAttrField(value)}
        sortable={false}
      >
        <Button icon={<FilterOutlined />} style={{ marginLeft: 8 }} />
      </AttrFieldPanelModal>
    )
  }
}

export default CustomColumn
