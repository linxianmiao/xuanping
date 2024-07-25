import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Modal, Form, Select, message } from '@uyun/components'
import CreateField from '~/create-field/layout/index'
import CreateStore from '~/create-field/store/createStore'
import { FIELD_TYPE_LIST } from '../../configuration'
import PropTypes from 'prop-types'
const FormItem = Form.Item
const Option = Select.Option
const createStore = new CreateStore()
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 }
}
@inject('formSetGridStore')
@observer
export default class Add extends Component {
  static contextTypes = {
    modelId: PropTypes.string
  }

  state = {
    visible: false,
    selectType: undefined,
    confirmLoading: false
  }

  handleSelect = val => {
    this.setState({ selectType: val })
    createStore.changeType(val)
  }

  handleOk = async () => {
    if (!this.state.selectType) {
      message.error(i18n('please.select.field.type', '请选择字段类型'))
      return
    }

    this.setState({ confirmLoading: true })
    const result = await this.createField.saveField()
    this.setState({ confirmLoading: false })
    if (!_.isEmpty(result)) {
      const { fieldList } = this.props.formSetGridStore
      const fieldsCode = _.map(fieldList, field => field.code)
      await this.props.formSetGridStore.saveModelFields({
        fieldCodes: [...fieldsCode, result.code],
        modelId: this.context.modelId
      })
      this.handleChangeVisible(false)
    }
  }

  handleChangeVisible = (visible) => {
    if (visible) {
      this.handleSelect(undefined)
    }
    this.setState({ visible })
  }

  render() {
    const { visible, selectType, confirmLoading } = this.state
    const diliver = {
      formItemLayout,
      store: createStore,
      queryType: '',
      userType: 'model'
    }
    return (
      <React.Fragment>
        <Modal
          destroyOnClose
          title={i18n('new_field', '新建字段')}
          wrapClassName="model-field-create-field-modal"
          visible={visible}
          confirmLoading={confirmLoading}
          onOk={this.handleOk}
          onCancel={() => { this.handleChangeVisible(false) }}
          width={800}
        >
          <div className="model-field-create-field-wrap">
            <FormItem label={i18n('field_header_type', '字段类型')} {...formItemLayout}>
              <Select
                allowClear
                showSearch
                value={selectType}
                onChange={this.handleSelect}
                optionFilterProp="children"
                notFoundContent={i18n('globe.not_find', '无法找到')}
                placeholder={`${i18n('globe.select', '请选择')}${i18n('field_header_type', '字段类型')}`}
              >
                {_.map(FIELD_TYPE_LIST, item => {
                  return <Option key={item.value} value={item.value}>{item.label}</Option>
                })}
              </Select>
            </FormItem>
            <CreateField wrappedComponentRef={node => { this.createField = node }} {...diliver} btnCancel={true} />
          </div>
        </Modal>
      </React.Fragment>
    )
  }
}