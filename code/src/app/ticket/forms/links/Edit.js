import React, { Component } from 'react'
import { Modal, Input, Select, Form } from '@uyun/components'
const Option = Select.Option
const FormItem = Form.Item

export default class EditModal extends Component {
  state={
    linkData: {}
  }

  change = (type, value) => {
    const { linkData } = this.state
    linkData[type] = value
    this.setState({ linkData })
  }

  componentDidMount() {
    this.setState({ linkData: _.cloneDeep(this.props.linkData) })
  }

  handleOk = () => {
    const { linkData } = this.state
    this.props.handleOk(linkData)
  }

  render() {
    const { visible } = this.props
    const { linkData = {} } = this.state
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 }
    }
    return (
      <Modal
        title={i18n('edit.link', '编辑链接')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.props.onCancel}
      >
        <FormItem
          {...formItemLayout}
          label={i18n('field_links_name', '链接名称')}
        >
          <Input onChange={e => { this.change('linkName', e.target.value) }} value={linkData.linkName} />
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={i18n('field_links_url', '链接地址')}
        >
          <Select
            value={linkData.linkProtocol}
            style={{ width: '100px' }}
            onChange={value => { this.change('linkProtocol', value) }}
          >
            <Option key={'http://'}>{'http://'}</Option>
            <Option key={'https://'}>{'https://'}</Option>
          </Select>
          <Input placeholder={i18n('menuModal.tip2', '请输入URL')} style={{ width: '200px', marginLeft: '10px' }} value={linkData.linkUrl} onChange={e => { this.change('linkUrl', e.target.value) }} />
        </FormItem>
      </Modal>
    )
  }
}