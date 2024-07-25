import React, { Component } from 'react'
import { Modal, message } from '@uyun/components'
import Transfer from './Transfer'

import './index.less'

class FieldMappingModal extends Component {
  static defaultProps = {
    visible: false,
    parModelId: '',
    subModelId: '',
    activityId: '',
    onClose: () => {}
  }

  state = {
    loading: false
  }

  transferRef = React.createRef()

  handleOk = () => {
    const { parModelId, subModelId, activityId } = this.props
    const mappingList = this.transferRef.current.getValue()

    this.setState({ loading: true })

    axios
      .post(API.saveModelFieldMappings, {
        parModelId,
        subModelId,
        activityId,
        relationVos: mappingList
      })
      .then((res) => {
        this.setState({ loading: false })
        // 成功时，后端返回1
        if (res === 1) {
          message.success(i18n('save_success'))
          this.props.onClose()
        }
      })
  }

  render() {
    const { visible, onClose, ...restProps } = this.props
    const { loading } = this.state

    return (
      <Modal
        title={i18n('config.mapping.field', '配置映射字段', 'Config Mapping Field')}
        width={700}
        destroyOnClose
        visible={visible}
        okButtonProps={{ loading }}
        onOk={this.handleOk}
        onCancel={onClose}
      >
        <Transfer ref={this.transferRef} {...restProps} />
      </Modal>
    )
  }
}

export default FieldMappingModal
