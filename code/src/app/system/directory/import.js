import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { InboxOutlined } from '@uyun/icons'
import { Modal, Upload, message, Progress } from '@uyun/components'
import RepeatModal from './repeatModal'
import './styles/import.less'
const Dragger = Upload.Dragger
@inject('directoryStore')
@observer
class TicketListImport extends Component {
  state = {
    percent: 0,
    showProgress: false,
    status: 'active',
    repeatvisible: false,
    data: {}
  }

  beforeUpload = (info) => {
    if (info.size > 20 * 1024 * 1024) {
      message.error(i18n('ticket.create.upload.tip1', '单文件上传文件最大20M'))
      return false
    }
    if (info.name.indexOf('.xlsx') === -1 && info.name.indexOf('.xls') === -1) {
      message.error(i18n('ticket.create.upload.tip2', '上传文件格式不正确'))
      return false
    }
  }

  handleChange = (info) => {
    if (info.file.response && info.file.response.errCode === 200) {
      const data = info.file.response.data
      if (data.result === true) {
        this.importSuccess()
      } else {
        this.setState({
          repeatvisible: true,
          data
        })
      }
    }
  }

  hideModal = () => {
    this.setState({
      repeatvisible: false,
      data: {}
    })
  }

  importSuccess = () => {
    message.success(i18n('ticket.forms.excel_success', 'Excel 导入成功'))
    this.props.directoryStore.getDirList()
    this.props.directoryStore.setKw()
    this.props.handleImportCancle()
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
    iframe.setAttribute('src', API.exportTemplate)
  }

  render() {
    const { visible } = this.props
    const { percent, showProgress, status, repeatvisible, data } = this.state
    const props = {
      multiple: false,
      beforeUpload: this.beforeUpload,
      showUploadList: false,
      action: API.importDirectory,
      // accept: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      onChange: this.handleChange
    }
    return (
      <Modal
        visible={visible}
        footer={null}
        title={i18n('ticket-list-import-dir', '导入目录')}
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
        {repeatvisible ? (
          <RepeatModal
            hideModal={this.hideModal}
            repeatvisible={repeatvisible}
            data={data || {}}
            importSuccess={this.importSuccess}
          />
        ) : null}
      </Modal>
    )
  }
}
export default TicketListImport
