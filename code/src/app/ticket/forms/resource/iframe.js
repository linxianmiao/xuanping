import React, { Component } from 'react'
import { Modal, Spin } from '@uyun/components'

export default class ResourceIframe extends Component {
  state = {
    loading: true
  }

  render() {
    const { iframeVisible, url, field } = this.props
    const data = {
      new: field.useScene.increased.value,
      edit: field.useScene.edit.value,
      batchEdit: field.useScene.batchEdit.value,
      copy: i18n('ticket.resource.copy', '复制'),
      look: this.props.name
    }
    return (
      <Modal
        title={data[iframeVisible]}
        visible={!!iframeVisible}
        onCancel={this.props.hideIframe}
        wrapClassName="ticket-resource-iframe"
        width="70%"
        footer={null}
        destroyOnClose
      >
        <Spin spinning={this.state.loading} className="ticket-resource-modal-iframe-spin">
          <iframe
            src={url}
            scrolling="yes"
            onLoad={() => {
              this.setState({ loading: false })
            }}
            className="editIframe"
            name="resourceIframe"
            frameBorder={0}
          />
        </Spin>
      </Modal>
    )
  }
}
