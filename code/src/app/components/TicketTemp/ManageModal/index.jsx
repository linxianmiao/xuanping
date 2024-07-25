import React, { Component } from 'react'
import { Modal } from '@uyun/components'
import Table from './Table'
import styles from './index.module.less'

export default class TempListModal extends Component {
  static defaultProps = {
    visible: false,
    onEdit: () => {},
    onClose: () => {}
  }

  render() {
    const { visible, onEdit, onClose } = this.props

    return (
      <Modal
        wrapClassName={styles.modalWrapper}
        title={i18n('template.manage', '模板管理')}
        visible={visible}
        width={1040}
        footer={null}
        destroyOnClose
        onCancel={onClose}
      >
        <Table onEdit={onEdit} />
      </Modal>
    )
  }
}
