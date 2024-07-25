import React, { Component } from 'react'
import { InboxOutlined } from '@uyun/icons'
import { Modal, Upload, Progress, Button } from '@uyun/components'

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
    if (info.file.response && info.file.response.errCode === 200) {
      this.setState({ showProgress: true }, () => {
        this.setProcess(info.file.response.data)
      })
    }
  }

  handleDownFile = (e, item) => {
    e.stopPropagation()
    if (item.filePath) {
      const a = document.createElement('a')
      a.href = item.filePath
      a.target = '_blank'
      a.download = item.fileName

      const xhr = new XMLHttpRequest()
      xhr.responseType = 'blob'

      xhr.onload = function () {
        a.href = URL.createObjectURL(xhr.response)

        document.body.appendChild(a)
        a.click()
        a.remove()
      }

      xhr.open('GET', a.pathname)
      xhr.send()
    }
  }

  handleError = (res) => {
    this.handleCancel()
    Modal.error({
      title: '导入失败',
      content: (
        <a
          onClick={(e) => {
            let url = `${API.DOWNLOAD}/${res.fileId}/${encodeURIComponent(res.fileName)}`
            this.handleDownFile(e, { filePath: url, fileName: res.fileName })
          }}
        >
          {res?.fileName}
        </a>
      )
    })
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  setProcess = (id) => {
    this.timer = setInterval(() => {
      this.props.dataBaseStore.getImportProgress(id).then((res) => {
        if (!_.isEmpty(res?.fileName) && !_.isEmpty(res?.fileId)) {
          this.handleError(res)
        } else if (res?.percent === '100') {
          this.setState({ percent: 100, status: 'success', showProgress: false }, () => {
            this.handleCancel()
          })
          this.props.onSuccess()
          if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
          }
        } else if (+res?.percent < 100) {
          this.setState({ percent: res?.percent || 0 })
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

  // 下载模板
  handleDownload = () => {
    const { dataSetId } = this.props
    const url = `${API.exportDataSheetTemplate}?dataSetId=${dataSetId}`

    window.open(url)
  }

  render() {
    const { dataSetId = '' } = this.props
    const { visible, showProgress, percent } = this.state

    const uploadProps = {
      multiple: false,
      showUploadList: false,
      accept: '.xls,.xlsx',
      action: `${API.importDataSheetItem}?dataSetId=${dataSetId}`,
      onChange: this.handleChange
    }

    return (
      <>
        <Button
          onClick={() => {
            this.setState({ visible: true })
          }}
        >
          导入
        </Button>

        <Modal
          title="导入表格"
          visible={visible}
          footer={null}
          onCancel={this.handleCancel}
          destroyOnClose
        >
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
