import React, { Component } from 'react'
import { InboxOutlined } from '@uyun/icons'
import { Modal, Upload, message, Progress } from '@uyun/components'
const Dragger = Upload.Dragger

class ImportModal extends Component {
  state = {
    paramData: {},
    progress: 0,
    showProgress: false
  }

  beforeUpload = (info) => {
    if (info.size > 20 * 1024 * 1024) {
      message.error(i18n('upload_max_size', '单文件上传文件最大20M'))
      return false
    }
    if (info.name.indexOf('.xlsx') === -1) {
      message.error(i18n('upload_error_3', '上传文件格式不正确'))
      return false
    }
    const data = {}
    data.fileName = info.name
    data.contentType = info.type
    if (info.type === '' || info.type == null) {
      data.contentType = '*/*'
    }
    this.setState({
      showProgress: true,
      paramData: data
    })
  }

  handleChange = (info) => {
    if (info.event) {
      this.setState({
        progress: ~~((info.event.loaded / info.event.total) * 98)
      })
    }
    if (info.file.response) {
      if (info.file.response.errCode === 200) {
        message.success(i18n('upload_siccess', '文件上传成功'))
        this.setState(
          {
            progress: ~~100
          },
          () => {
            this.props.onFresh()
          }
        )
      } else {
        const code = 'w' + info.file.response.errCode
        message.error(i18n(code))
        this.props.onCancel()
      }
    }
  }

  render() {
    const { visible } = this.props
    const { paramData, showProgress, progress } = this.state
    const props = {
      name: 'file',
      data: paramData,
      multiple: false,
      beforeUpload: this.beforeUpload,
      showUploadList: false,
      action: API.customer_import,
      onChange: this.handleChange
    }
    return (
      <Modal
        visible={visible}
        title={i18n('import_user_title', '导入Excel新增或更新数据')}
        onCancel={this.props.onCancel}
        width={520}
        footer={false}
      >
        <div className={'customer-batch-import'}>
          <div className={showProgress ? 'importing' : ''}>
            <h2>{i18n('ticket-import', '工单导入')}</h2>
            <Progress className="upload-pro" percent={progress} />
          </div>
          <div className={!showProgress ? 'imported' : ''}>
            <h2>
              {i18n('batch-import-tips', '您是否有标准的Excel模版，需要依照模版导入，否则会失败')}
            </h2>
            <div className="customer-batch-import-upload">
              <Dragger {...props}>
                <p className="u4-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="u4-upload-text">
                  {i18n('upload_click_tips', '点击或将文件拖拽到此区域上传')}
                </p>
              </Dragger>
            </div>
            <a
              href={API.template_download}
              target="view_window"
              className="batch-import-template-download"
            >
              {i18n('upload_template_url', '还没有Excel模版？请下载模版')}
            </a>
          </div>
        </div>
      </Modal>
    )
  }
}

export default ImportModal
