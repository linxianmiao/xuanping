import React, { Component } from 'react'
import { UploadOutlined } from '@uyun/icons'
import { Upload, Button, Icon } from '@uyun/components'

export default class UploadButton extends Component {
  render() {
    const { fileListProps, ticketId } = this.props

    const title = !ticketId ? i18n('attachfile-no-ticketid', '请在工单中编辑附件字段') : undefined
    return (
      <Upload {...fileListProps}>
        <Button title={title}>
          <UploadOutlined /> {i18n('ticket.from.upload', '选择文件')}
        </Button>
      </Upload>
    )
  }
}
