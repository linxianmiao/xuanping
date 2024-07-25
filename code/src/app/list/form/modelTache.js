import React, { Component } from 'react'
import { Form, TreeSelect, Spin } from '@uyun/components'
import { inject, observer } from 'mobx-react'
const FormItem = Form.Item

@inject('listStore')
@observer
class ModelTache extends Component {
  componentDidMount() {
    const { modelAndTacheIdList } = this.props.listStore
    if (this.props.defaultValue && _.isEmpty(modelAndTacheIdList)) {
      this.props.listStore.getModelAndTacheIdList()
    }
  }

  onDropdownVisibleChange = (visible) => {
    const { modelAndTacheIdList } = this.props.listStore
    if (visible && _.isEmpty(modelAndTacheIdList)) {
      this.props.listStore.getModelAndTacheIdList()
    }
  }

  render() {
    const { item, formItemLayout, getFieldDecorator, defaultValue, getPopupContainer, disabled, label } = this.props
    const { modelAndTacheIdList } = this.props.listStore
    return (
      <FormItem label={label || item.name} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(
          <TreeSelect
            disabled={disabled}
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