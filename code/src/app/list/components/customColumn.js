import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import { Button, message, Tooltip } from '@uyun/components'
import attribute from '../config/attribute'
import FilterFields from './FilterFields'
import AttrFieldPanelModal from '~/components/AttrFieldPanel'
import { disabledFilter } from '../config/filter'
@inject('listStore')
@observer
class CustomColumn extends Component {
  handleChange = ({ value, checked }) => {
    const { attributeList } = this.props.listStore
    if (checked) {
      this.props.listStore.setAttributeList([...attributeList, value])
    } else {
      this.props.listStore.setAttributeList(_.filter(attributeList, (item) => item !== value))
    }
  }

  handleClick = () => {
    const { allField } = this.props.listStore
    if (_.isEmpty(allField.builtinFields)) {
      this.props.listStore.getAllColumns()
    }
  }

  handleChangeAttrField = (value) => {
    const valueCode = value.map((item) => item.code)
    if (valueCode.length === 0) {
      message.info('定制列至少保留一项')
      return
    }
    this.props.listStore.setSelectedList(value, 'COLUMN')
    this.props.listStore.setAttributeList(valueCode)
  }

  render() {
    const {
      allField,
      attributeList,
      cusColLoading,
      setAttributeList,
      columnAttrList,
      columnSelectedList
    } = this.props.listStore
    const { builtinFields, extendedFields } = allField

    return (
      // <FilterFields
      //   sortable
      //   checkedColumnCodes={attributeList}
      //   setCheckedCodes={setAttributeList}
      //   fixedFields={attribute}
      //   builtinFields={builtinFields}
      //   extendedFields={extendedFields}
      //   onChange={this.handleChange}
      //   loading={cusColLoading}
      //   getPopupContainer={() => document.querySelector('#ticket-list-filter-warp')}
      // >
      <AttrFieldPanelModal
        title={i18n('custom.columns', '定制列')}
        attrList={toJS(columnAttrList)}
        selected={[...toJS(columnSelectedList)]}
        modelIds={this.props.ticketViewModelId}
        onChange={(value) => this.handleChangeAttrField(value)}
      >
        <Tooltip title={i18n('custom.columns', '定制列')}>
          <Button icon={<i className="iconfont icon-filter-column" />} />
        </Tooltip>
      </AttrFieldPanelModal>
      // </FilterFields>
    )
  }
}
export default CustomColumn
