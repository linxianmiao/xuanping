import React, { Component } from 'react'
import { inject } from 'mobx-react'
import { Modal, Alert, message } from '@uyun/components'
import Form from './Form'
import { filterDockField, undefinedToNull } from '../logic'

@inject('ticketTemplateStore', 'tableListStore')
export default class EditModal extends Component {
  static defaultProps = {
    template: null, // 模板详情
    modelId: '',
    fieldList: [],
    getTicketValues: () => {},
    saveSuccessCallback: () => {}, // 保存成功后的回调
    onClose: () => {}
  }

  state = {
    loading: false
  }

  tempRef = React.createRef()

  handleOk = () => {
    this.tempRef.current.props.form.validateFields(async (errors, values) => {
      if (errors) return

      const {
        template: { templateId },
        modelId,
        fieldList,
        getTicketValues,
        saveSuccessCallback,
        onClose
      } = this.props
      const getValues = _.flow([filterDockField, getTicketValues, undefinedToNull])
      const filtFields = fieldList.filter(d => d.code)
      const data = {
        ...values,
        modelId,
        templateId,
        formData: getValues(filtFields)
      }
      this.setState({ loading: true })
      const res = await axios.post(API.saveModelFormTemplate, data)
      this.setState({ loading: false })
      if (res) {
        await this.props.tableListStore.saveTableData(true, { ticketTemplateId: res })
        message.success(i18n('save_success', '保存成功'))
        // 保存后清空下拉列表的数据，使得下次下拉重新获取数据
        this.props.ticketTemplateStore.setProps({ temp: {} })
        saveSuccessCallback && saveSuccessCallback()
        onClose()
      }
    })
  }

  render() {
    const { template, onClose } = this.props
    const { loading } = this.state

    return (
      <Modal
        title={i18n('save-ticket-template')}
        zIndex={1010}
        destroyOnClose
        visible={Boolean(template)}
        confirmLoading={loading}
        onCancel={onClose}
        onOk={this.handleOk}
      >
        <Alert message="将当前表单内容保存为模板，供下次创建时使用" type="info" showIcon />

        <Form tempData={template} wrappedComponentRef={this.tempRef} />
      </Modal>
    )
  }
}
