import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { message } from '@uyun/components'
import UploadButton from './UploadButton'
import UploadDragger from './UploadDragger'
import UploadFileList from './UploadFileList'
import UploadProcess from './UploadProcess'

@inject('globalStore')
@observer
class UploadMode extends Component {
  static defaultProps = {
    mode: 'button' // button | dragger     按钮展示（表格中用） | 框展示（表单中用）
  }

  fileProcessList = []

  state = {
    fileProcessList: []
  }

  // 上传前操作
  beforeUpload = (info) => {
    // 预览禁止上传
    if (this.props.type === 'preview') {
      message.error(i18n('upload_file_preview', '附件预览的时候无法上传文件'))
      return false
    }
    if (info.size > 20 * 1024 * 1024) {
      message.error(`${info.name} ${i18n('upload_file_too_big', '文件过大')}`)
      return false
    }
    // beforeUpload 多文件一起得时候触发太快，state来不及更新
    this.fileProcessList.push({
      name: info.name,
      uid: info.uid,
      progress: 0,
      isShow: true
    })
    this.setState({
      fileProcessList: [...this.fileProcessList]
    })
  }

  onChange = (e) => {
    const { value } = this.props
    if (e.event) {
      this.setState({
        fileProcessList: _.map(this.state.fileProcessList, (item) => {
          if (item.uid === e.file.uid) {
            return _.assign({}, item, { progress: Math.min(~~e.event.percent, 90) })
          }
          return item
        })
      })
    }
    if (e.file.percent === 100 && e.file.response) {
      this.setState(
        {
          fileProcessList: _.map(this.state.fileProcessList, (item) => {
            if (item.uid === e.file.uid) {
              return _.assign({}, item, { progress: 100, isShow: false })
            }
            return item
          })
        },
        () => {
          this.fileProcessList = this.state.fileProcessList
        }
      )

      // 没有id的话就是上传失败
      const idData = e.file.response.data
      if (idData) {
        const data = {
          id: idData.fileId,
          uid: e.file.uid,
          name: e.file.name,
          uploadUser: idData.uploadUser,
          activityName: idData.activityName,
          uploadTime: idData.uploadTime,
          status: 'done',
          source: 'itsm'
        }
        this.props.onChange([...value, data])
      } else {
        message.error(i18n('w1023'))
        this.props.onChange([...value])
      }
    }
  }

  getData = (info) => {
    return {
      fieldCode: this.props.field.code,
      fileName: encodeURIComponent(info.name),
      fileLength: info.size,
      outId: this.props.ticketId,
      tacheId: this.props.tacheId,
      contentType: info.type || '*/*'
    }
  }

  // 删除附件
  handleMove = (id) => {
    const { ticketId } = this.props
    // 服务端删除该附件
    let url = `${API.deleteFile}/${id}?ticketId=${ticketId}`
    if (this.props?.tableColCode) {
      url += `&tableColCode=${this.props?.tableColCode}`
    }
    axios.post(url).then((res) => {
      if (res) {
        // 表单数据中删除该附件
        const { value } = this.props
        const files = _.filter(value, (item) => item.id !== id)
        this.props.onChange(files)
      }
    })
  }

  render() {
    const { disabled, canUpload, canDownload, value, mode, ticketId, field } = this.props
    const { fileProcessList } = this.state
    const { fileAccept } = this.props.globalStore
    const accept = fileAccept ? fileAccept.join(',') : ''
    const fileListProps = {
      accept,
      multiple: true,
      disabled: field.isRequired === 2,
      action: API.UPLOAD,
      beforeUpload: this.beforeUpload,
      onChange: this.onChange,
      data: this.getData,
      showUploadList: false
    }
    return (
      <React.Fragment>
        {mode === 'button' && canUpload && !disabled && field.isRequired !== 2 && (
          <UploadButton ticketId={ticketId} fileListProps={fileListProps} />
        )}
        {mode === 'dragger' && canUpload && !disabled && field.isRequired !== 2 && (
          <UploadDragger fileListProps={fileListProps} />
        )}
        <UploadFileList
          value={value}
          canUpload={canUpload}
          canDownload={canDownload}
          handleMove={this.handleMove}
          disabled={field.isRequired === 2}
          fileTemplate={field.fileTemplate}
        />
        <UploadProcess fileProcessList={fileProcessList} />
      </React.Fragment>
    )
  }
}

export default UploadMode
