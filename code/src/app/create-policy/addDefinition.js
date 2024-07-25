import React, { Component } from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Modal } from '@uyun/components'
import Forms from '../create-definition/forms'
import '../create-definition/styles/createServiceTime.less'
@inject('createDefinitionStore')
@observer
class DefinitionIndex extends Component {
  constructor (props) {
    super(props)
    this.formRef = React.createRef()
    this.state = {
      loading: false
    }
  }

  async componentDidMount () {
    await this.props.createDefinitionStore.queryTimePolicy()
  }

  componentWillUnmount () {
    this.props.createDefinitionStore.distory()
  }

    handleSubmit = () => {
      this.formRef.current.validateFields(async (errors, values) => {
        if (errors) {
          return false
        }
        this.setState({ btnLoading: true })
        const res = await this.props.createDefinitionStore.createSLA(values)
        this.setState({ btnLoading: false })
        if (res === '200') {
          this.props.handleAddAgreement(false, 'submit')
        }
      })
    }

    handleCancel = () => {
      this.props.handleAddAgreement(false)
    }

    render () {
      const { visible } = this.props
      const { btnLoading } = this.state
      const formItemLayout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 18 }
      }
      return (
        <Modal
          destroyOnClose
          visible={visible}
          onOk={this.handleSubmit}
          onCancel={this.handleCancel}
          confirmLoading={btnLoading}
          title={i18n('sla_add_definition', '新增SLA')}>
          <Forms ref={this.formRef} formItemLayout={formItemLayout} />
        </Modal>

      )
    }
}

export default DefinitionIndex
