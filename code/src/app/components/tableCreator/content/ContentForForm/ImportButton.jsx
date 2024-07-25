import React, { Component } from 'react'
import { InboxOutlined } from '@uyun/icons'
import { Modal, Upload, message, Progress, Button, Tooltip } from '@uyun/components'

const { Dragger } = Upload

export default class ImportButton extends Component {
  state = {
    visible: false,
    percent: 0,
    showProgress: false
  }

  handleCancel = () => {
    this.setState({
      visible: false,
      percent: 0,
      showProgress: false
    })
  }

  handleChange = (info) => {
    const { status, response, percent } = info.file

    this.setState({
      showProgress: true,
      percent
    })

    if (status === 'done') {
      this.handleCancel()

      if (response.errCode !== 200) {
        message.error(i18n(`w${response.errCode}`))
      } else if (response.data.uploadResult) {
        message.success('导入成功')
        this.props.onSuccess()
      } else if (!response.data.uploadResult && response.data.message) {
        Modal.error({
          content: <pre>{response.data.message}</pre>
        })
      }
    }
  }

  // 下载模板
  handleDownload = () => {
    const { ticketId, caseId, modelId, fieldCode } = this.props
    const url = `${API.exportTableTemplate}?ticketId=${ticketId}&caseId=${caseId}&modelId=${modelId}&fieldCode=${fieldCode}`

    window.open(url)
  }

  render() {
    const { ticketId, caseId = '', modelId, fieldCode } = this.props
    const { visible, showProgress, percent } = this.state

    const uploadProps = {
      multiple: false,
      showUploadList: false,
      accept: '.xls,.xlsx',
      action: `${API.importTable}?ticketId=${ticketId}&caseId=${caseId}&modelId=${modelId}&fieldCode=${fieldCode}`,
      onChange: this.handleChange
    }

    return (
      <>
        <Tooltip title="当前表格导入为增量导入">
          <Button
            disabled={this.props.disabled}
            style={{ marginRight: 10 }}
            onClick={() => {
              this.props.store.saveData().then(() => {
                this.setState({ visible: true })
              })
            }}
          >
            导入
          </Button>
        </Tooltip>

        <Modal title="导入表格" visible={visible} footer={null} onCancel={this.handleCancel}>
          {showProgress && <Progress percent={percent} />}
          <div
            style={{ height: showProgress ? '0' : 'auto', overflow: 'hidden' }}
            className="ticket-list-import"
          >
            <div style={{ height: 180 }}>
              <Dragger {...uploadProps}>
                <p className="u4-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="u4-upload-text">
                  {i18n('ticket.list.click', '点击或将文件拖拽此区域上传')}
                </p>
              </Dragger>
            </div>
            <a className="ticket-list-import-tip2" onClick={this.handleDownload}>
              {i18n('ticket.list.template', '还没有Excel模版?请下载模版')}
            </a>
          </div>
        </Modal>
      </>
    )
  }
}
