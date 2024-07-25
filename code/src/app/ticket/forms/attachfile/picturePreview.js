import React from 'react'
import { Modal } from '@uyun/components'
export default class PicturePreview extends React.Component {
  render() {
    const { previewVisible, currentUrl, handleCancel } = this.props
    return (
      <Modal visible={previewVisible} footer={null} onCancel={handleCancel} size="large">
        <img style={{ width: '100%' }} src={currentUrl} />
      </Modal>
    )
  }
}
