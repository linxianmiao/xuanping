import React, { Component, createRef } from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { FilterOutlined } from '@uyun/icons';
import { Button } from '@uyun/components'
import { inject } from '@uyun/core'
import FilterFields from '../../common/FilterFields'
import { defaultColumnList } from '../../listConfig'
import AttrFieldPanelModal from '~/components/AttrFieldPanel'

@observer
export default class CustomColumn extends Component {
  @inject('listStore') listStore
  @inject('i18n') i18n

  sortable = null
  wrapperRef = createRef()

  handleBtnClick = () => {
    this.listStore.getAllColumns()
  }

  handleChange = ({ value, checked }) => {
    const { checkedColumnCodes } = this.listStore
    let newCodes
    if (checked) {
      newCodes = [...checkedColumnCodes, value]
    } else {
      newCodes = checkedColumnCodes.filter(code => code !== value)
    }
    this.listStore.setProps({ checkedColumnCodes: newCodes })
  }

  setCheckedCodes = codes => {
    this.listStore.setProps({ checkedColumnCodes: codes })
  }

  handleChangeAttrField = value => {
    const valueCode = value.map(item => item.code)
    if (valueCode.length === 0) {
      message.info('定制列至少保留一项')
      return
    }
    this.listStore.setSelectedList(value, 'COLUMN')
    this.listStore.setProps({ checkedColumnCodes: valueCode })
  }

  render() {
    const { checkedColumnCodes, allField: { builtinFields, extendedFields }, cusColLoading, columnSelectedList } = this.listStore
    return (
      // <FilterFields
      //   sortable
      //   checkedColumnCodes={checkedColumnCodes}
      //   setCheckedCodes={this.setCheckedCodes}
      //   onChange={this.handleChange}
      //   fixedFields={defaultColumnList}
      //   builtinFields={builtinFields}
      //   extendedFields={extendedFields}
      //   loading={cusColLoading}
      // >
      //   <Button icon="filter" style={{ marginRight: 16 }} onClick={this.handleBtnClick} />
      // </FilterFields>
      <AttrFieldPanelModal
        title={'定制列'}
        attrList={defaultColumnList}
        selected={[...toJS(columnSelectedList)]}
        onChange={value => this.handleChangeAttrField(value)}
        sortable={false}
      >
        <Button icon={<FilterOutlined />} style={{ marginRight: 16 }} />
      </AttrFieldPanelModal>
    );
  }
}
