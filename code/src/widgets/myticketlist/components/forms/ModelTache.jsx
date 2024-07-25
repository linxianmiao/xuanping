import React, { Component } from 'react'
import { Form, TreeSelect, Spin } from '@uyun/components'
import { observer } from 'mobx-react'
import { inject } from '@uyun/core'
import { TicketlistStore } from '../../ticketlist.store'
const FormItem = Form.Item
const SHOW_CHILD = TreeSelect.SHOW_CHILD

@observer
class ITSMTreeSelect extends Component {
  @inject(TicketlistStore) store

  @inject('i18n') i18n

  componentDidMount() {
    const { modelAndTacheIdList } = this.store
    if (this.props.defaultValue && _.isEmpty(modelAndTacheIdList)) {
      this.store.getModelAndTacheIdList()
    }
  }

  onDropdownVisibleChange = (visible) => {
    const { modelAndTacheIdList } = this.store
    if (visible && _.isEmpty(modelAndTacheIdList)) {
      this.store.getModelAndTacheIdList()
    }
  }

  render() {
    const { value, onChange, disabled, name } = this.props
    const { modelAndTacheIdList } = this.store
    return (
      <TreeSelect
        allowClear
        multiple
        treeCheckable
        // treeDefaultExpandAll
        value={value}
        size="small"
        onChange={onChange}
        treeNodeFilterProp="label"
        disabled={disabled}
        treeData={modelAndTacheIdList}
        showCheckedStrategy={SHOW_CHILD}
        onDropdownVisibleChange={this.onDropdownVisibleChange}
        notFoundContent={
          _.isEmpty(modelAndTacheIdList) ? <Spin /> : this.i18n('globe.not_find', '无法找到')
        }
        placeholder={`请选择${name}`}
      />
    )
  }
}

class ModelTache extends Component {
  render() {
    const { item, formItemLayout, getFieldDecorator, defaultValue, disabled } = this.props

    return (
      <FormItem label={''} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(<ITSMTreeSelect disabled={disabled} name={item.name} />)}
      </FormItem>
    )
  }
}
export default ModelTache
