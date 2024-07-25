import React from 'react'
import { InboxOutlined } from '@uyun/icons'
import { Modal, Upload, message, Progress } from '@uyun/components'

import T from 'prop-types'
import './index.less'

const { Dragger } = Upload

const noop = () => {}

export default class ImportExcel extends React.Component {
  static defaultProps = {
    title: '',
    onCancel: noop,
    getList: noop
  }

  static propTypes = {
    children: T.element.isRequired,
    importSrc: T.string.isRequired,
    templateSrc: T.string.isRequired
  }

  state = {
    visible: false,
    importInfo: {},
    showProgress: false,
    msgList: []
  }

  toggleModal = (visible) => {
    this.setState({ visible, msgList: [], importInfo: {}, showProgress: false })
  }

  handleCancel = () => {
    this.toggleModal(false)
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.props.onCancel()
  }

  beforeUpload = (info) => {
    if (info.size > 20 * 1024 * 1024) {
      message.error(i18n('ticket.create.upload.tip1', '单文件上传文件最大20M'))
      return false
    }
    if (info.name.indexOf('.xlsx') === -1) {
      message.error(i18n('ticket.create.upload.tip2', '上传文件格式不正确'))
      return false
    }
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
    iframe.setAttribute('src', this.props.templateSrc)
  }

  handleChange = async (info) => {
    const { matrixStore } = this.props
    const { status, response } = info.file
    let msg = []
    if (status === 'done') {
      this.setState({ showProgress: true })
      const { data, errCode } = response
      if (errCode === 200) {
        if (data.code) {
          this.timer = setInterval(async () => {
            const res = (await matrixStore.getImportMatrixProgress(data.code)) || {}
            const { msgList, progress, status, total } = res
            if (!_.isEmpty(msgList) && Array.isArray(msgList)) msg = [...msg, ...msgList]
            this.setState({
              importInfo: {
                msgList: msg,
                progress: total !== 0 && parseInt((progress / total) * 100),
                status,
                total
              }
            })
            if (status === 6) {
              if (this.timer) {
                clearInterval(this.timer)
                this.timer = null
              }
              this.setState({
                visible: false,
                showProgress: false
              })
              message.success(i18n('import.sucess'))
              this.props.getList()
            } else if (status === 5) {
              if (this.timer) {
                clearInterval(this.timer)
                this.timer = null
              }
            }
          }, 1000)
        }
      }
    } else if (status === 'error') {
      message.error(i18n('import-failed', '导入失败'))
    }
  }

  _renderStatus = (status) => {
    /**
     * 状态
     * 0：开始导入
     * 1：校验列是否可删除
     * 2：解析行
     * 3：解析结束
     * 4：校验通过
     * 5：校验不通过
     * 6：导入成功
     */
    switch (status) {
      case 0:
        return '1/5 开始导入'
      case 1:
        return '2/5 校验列是否可删除'
      case 2:
        return '3/5 解析行'
      case 3:
        return '4/5 解析结束'
      case 4:
        return '5/5 校验通过'
      case 5:
        return '校验不通过'
      case 6:
        return '导入成功'
      default:
        break
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  render() {
    const { children, title, importSrc } = this.props
    const { visible, showProgress, importInfo } = this.state

    const { msgList, progress, status, total } = importInfo
    const dragProps = {
      multiple: false,
      beforeUpload: this.beforeUpload,
      showUploadList: false,
      action: importSrc,
      accept:
        'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      onChange: this.handleChange
    }
    return (
      <React.Fragment>
        {children &&
          React.Children.map(children, (child) =>
            React.cloneElement(child, {
              onClick: () => this.toggleModal(true)
            })
          )}
        <Modal
          title={title}
          visible={visible}
          footer={null}
          onCancel={this.handleCancel}
          wrapClassName="import-excel-modal"
          destroyOnClose
        >
          {!showProgress && (
            <>
              <h3>
                {i18n(
                  'ticket.list.import.tip3',
                  '您是否有标准的Excel模版，需要依照模版导入，否则会失败'
                )}
              </h3>
              <div style={{ height: 180 }}>
                <Dragger {...dragProps}>
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
            </>
          )}

          {showProgress && (
            <div>
              {status === 5 ? (
                <>
                  {' '}
                  <Progress percent={100} status="exception" />
                  <p className="process-info">{msgList && msgList.join('\n')}</p>
                </>
              ) : (
                <>
                  {this._renderStatus(status)}
                  {total !== 0 && <Progress percent={progress} />}
                  <p className="process-info">{msgList && msgList.join('\n')}</p>
                </>
              )}
            </div>
          )}
        </Modal>
      </React.Fragment>
    )
  }
}
