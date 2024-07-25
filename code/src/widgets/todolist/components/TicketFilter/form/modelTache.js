import React, { Component } from 'react'
import { Form, TreeSelect, Spin } from '@uyun/components'
import { observer } from 'mobx-react'
import { inject } from '@uyun/core'
const FormItem = Form.Item

@observer
class ModelTache extends Component {
  @inject('listStore') listStore
  componentDidMount() {
    const { modelAndTacheIdList } = this.listStore
    if (this.props.defaultValue && _.isEmpty(modelAndTacheIdList)) {
      this.listStore.getModelAndTacheIdList()
    }
  }

  onDropdownVisibleChange = visible => {
    const { modelAndTacheIdList } = this.listStore
    if (visible && _.isEmpty(modelAndTacheIdList)) {
      this.listStore.getModelAndTacheIdList()
    }
  }

  render() {
    const { item, formItemLayout, getFieldDecorator, defaultValue, getPopupContainer } = this.props
    const { modelAndTacheIdList } = this.listStore
    return (
      <FormItem label={item.name} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(
          <TreeSelect
            allowClear
            multiple
            treeCheckable
            size="small"
            treeNodeFilterProp="label"
            treeDefaultExpandAll
            treeData={modelAndTacheIdList}
            showCheckedStrategy={TreeSelect.SHOW_CHILD}
            onDropdownVisibleChange={this.onDropdownVisibleChange}
            notFoundContent={_.isEmpty(modelAndTacheIdList) ? <Spin /> : i18n('globe.not_find', '无法找到')}
            placeholder={`${i18n('globe.select', '请选择')}${item.name}`}
            getPopupContainer={getPopupContainer}
          />)}
      </FormItem>
    )
  }
}
export default ModelTache
