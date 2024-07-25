import React, { Component, Fragment } from 'react'
import { inject, observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { Button, message } from '@uyun/components'
import UploadModal from './UploadModal'

@inject('resourceStore')
@observer
class AssetUpload extends Component {
  state = {
    visible: false
  }

  static contextTypes = {
    ticketId: PropTypes.string
  }

  handleShowModal = async (e) => {
    if (this.props.type === 'preview') {
      message.error(i18n('ticket.create.preview', '预览页面暂不支持导入操作'))
      e.stopPropagation()
      return
    }
    const { resourceStore, setFieldsValue } = this.props

    if (!resourceStore.sandboxId) {
      const res = await resourceStore.createCMDBSanbox(this.context.ticketId)
      resourceStore.setSandboxID(res.sandboxId)
      setFieldsValue({ sanboxId: res.sandboxId })
    }

    this.setState({ visible: true })
  }

  render() {
    const { visible } = this.state
    const { onComplete, fieldType, modelCode, redundantAttribute, ticketId, fieldId } = this.props
    const { sandboxId } = this.props.resourceStore

    return (
      <Fragment>
        <Button onClick={this.handleShowModal}>{i18n('import', '导入')}</Button>
        <UploadModal
          fieldType={fieldType}
          modelCode={modelCode}
          sandboxId={sandboxId}
          visible={visible}
          onClose={() => this.setState({ visible: false })}
          onComplete={onComplete}
          redundantAttribute={redundantAttribute}
          ticketId={ticketId}
          fieldId={fieldId}
        />
      </Fragment>
    )
  }
}

AssetUpload.defaultProps = {
  fieldType: '',
  modelCode: '',
  onComplete: () => {}
}

export default AssetUpload
