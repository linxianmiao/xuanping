import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { InboxOutlined } from '@uyun/icons'
import { Modal, Upload, message, Progress } from '@uyun/components'
import '../styles/import.less'
const Dragger = Upload.Dragger
@inject('listStore')
@observer
class TicketListImport extends Component {
  state = {
    percent: 0,
    showProgress: false,
    status: 'active'
  }

  beforeUpload = (info) => {
    if (info.size > 20 * 1024 * 1024) {
      message.error(i18n('ticket.create.upload.tip1', '单文件上传文件最大20M'))
      return false
    }
    if (!info.name.endsWith('.xlsx')) {
      message.error(i18n('ticket.create.upload.tip2', '上传文件格式不正确'))
      return false
    }
  }

  handleChange = (info) => {
    if (info.file.response && info.file.response.errCode === 200) {
      this.setState({ showProgress: true }, () => {
        this.setProcess(info.file.response.data)
      })
    }
  }

  setProcess = (id) => {
    this.timer = setInterval(() => {
      this.props.listStore.getImportProgress(id).then((res) => {
        if (res === '100') {
          this.setState({ percent: 100, status: 'success', showProgress: false }, () => {
            this.props.handleImportCancle()
          })
          const { pageSize } = this.props.listStore
          this.props.listStore.setCurrentAndPageSize(1, pageSize)
          this.props.listStore.getList()
          if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
          }
        } else if (+res < 100) {
          this.setState({ percent: res || 0 })
        } else {
          this.setState({ percent: 100, status: 'exception' })
          if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
          }
        }
      })
    }, 1000)
  }

  handleDownload = () => {
    let iframe = document.getElementById('ticketListDownLoadIframe')
    if (!iframe) {
      iframe = document.createElement('iframe')
      iframe.setAttribute('id', 'ticketListDownLoadIframe')
      iframe.setAttribute('width', '0')
      iframe.setAttribute('height', '0')
      document.body.appendChild(iframe)
    }
    iframe.setAttribute('src', API.EXPORT_TICKET_TEMPLATE)
  }

  render() {
    const { visible } = this.props
    const { percent, showProgress, status } = this.state
    const props = {
      multiple: false,
      beforeUpload: this.beforeUpload,
      showUploadList: false,
      action: API.WORKUPLOAD,
      accept:
        'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      onChange: this.handleChange
    }
    return (
      <Modal
        visible={visible}
        footer={null}
        title={i18n('ticket-list-import-title', '导入工单')}
        onCancel={() => {
          this.props.handleImportCancle(() => {
            this.setState({ percent: 0, status: 'active', showProgress: false })
          })
        }}
      >
        {!showProgress && (
          <div className="ticket-list-import">
            <h3>
              {i18n(
                'ticket.list.import.tip3',
                '您是否有标准的Excel模版，需要依照模版导入，否则会失败'
              )}
            </h3>
            <div style={{ height: 180 }}>
              <Dragger {...props}>
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
        )}
        {showProgress && <Progress percent={percent} status={status} />}
      </Modal>
    )
  }
}
export default TicketListImport
