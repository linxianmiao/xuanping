import React, { Component } from 'react'
import { Button, Modal, message } from '@uyun/components'
import Transfer from './Transfer'

import './index.less'

class FieldMapping extends Component {
  static defaultProps = {
    type: '', // 1:表示创建时的映射，2:表示回写时的映射
    parNodeId: '',
    parModelId: '',
    subNodeId: '',
    subModelId: '',
    onModelMiss: () => {}
  }

  state = {
    visible: false,
    loading: false
  }

  transferRef = React.createRef()

  handleOpen = () => {
    const { parModelId, subModelId, onModelMiss } = this.props

    if (!parModelId) {
      onModelMiss('par')
    } else if (!subModelId) {
      onModelMiss('sub')
    } else {
      this.setState({ visible: true })
    }
  }

  handleOk = () => {
    const { type, parNodeId, parModelId, subNodeId, subModelId } = this.props
    const mappingList = this.transferRef.current.getValue()

    this.setState({ loading: true })

    axios
      .post(API.saveModelFieldMappings, {
        type,
        parModelId,
        subModelId,
        relationVos: mappingList
      })
      .then((res) => {
        this.setState({ loading: false })
        // 成功时，后端返回1
        if (res === 1) {
          message.success(i18n('save_success'))
          this.setState({ visible: false })
        }
      })
  }

  render() {
    const { buttonTxt, ...restProps } = this.props
    const { loading, visible } = this.state
    return (
      <>
        <Button size="small" onClick={this.handleOpen}>
          {buttonTxt || i18n('config.mapping.field', '配置映射字段', 'Config Mapping Field')}
        </Button>

        <Modal
          title={i18n('config.mapping.field', '配置映射字段', 'Config Mapping Field')}
          width={700}
          destroyOnClose
          visible={visible}
          okButtonProps={{ loading }}
          onOk={this.handleOk}
          onCancel={() => this.setState({ visible: false })}
        >
          <Transfer ref={this.transferRef} {...restProps} />
        </Modal>
      </>
    )
  }
}

export default FieldMapping
