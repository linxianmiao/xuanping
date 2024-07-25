import React, { Component } from 'react'
import { store as runtimeStore } from '@uyun/runtime-react'
import { PaperClipOutlined } from '@uyun/icons'
import { Select, message, Upload, Icon } from '@uyun/components'
import * as mobx from 'mobx'
import { inject } from 'mobx-react'
import Editor from '../mention'
import TextAreaEditor from './textarea'
import uuidv4 from 'uuid/v4'
import { Browser } from '../../utils'

const Option = Select.Option
const style = {
  width: 150,
  top: '30px',
  right: '8.33333%',
  position: 'absolute',
  zIndex: 2
}
@inject('userStore', 'ticketStore', 'globalStore')
class ContentEditable extends Component {
  state = {
    selectVisible: false, // 点击@以后人员选择框的显示
    toUserList: [], // @的人员列表
    userLabels: [],
    fileList: [],
    pureText: '', // 评论的内容
    value: '' // div框里展示给用户的内容
  }

  componentDidMount() {
    const { fileAccept } = this.props.globalStore

    if (!fileAccept && this.props.formMode !== 'new') {
      this.props.globalStore.getFileAccept()
    }
  }

  // 点击@以后出现人员选择确定
  // selectChange = value => {
  //   let val = this.state.value
  //   val += ' <a user_id="' + value.key + '" >@' + value.label + '</a> '
  //   this.setState(prevState => {
  //     const { pureText, toUserList } = prevState

  //     toUserList.push(value.key)

  //     return {
  //       selectVisible: false,
  //       value: val,
  //       pureText: pureText + '@' + value.label,
  //       toUserList
  //     }
  //   })
  // }
  selectChange = (value) => {
    let val = this.state.value
    val += ' @' + value.label + ' '

    this.setState((prevState) => {
      const { pureText, toUserList, userLabels } = prevState

      toUserList.push(value.key)
      userLabels.push(value.label)
      return {
        selectVisible: false,
        value: val,
        pureText: pureText + '@' + value.label,
        toUserList,
        userLabels
      }
    })
  }

  // 点击@以后出现人员选择显示
  showSelect = () => {
    if (!this.props.ticketStore.detailForms.canComment) return false
    this.setState({ selectVisible: true })
  }

  // 点击@以后出现人员选择隐藏
  selectBlur = () => {
    this.setState({ selectVisible: false })
  }

  // 选择人员
  // handleChange = (value, pureText, mentions) => {
  //   const toUserList = mentions.map(mention => mention.id)
  //   this.setState({ value, pureText, toUserList })
  // }
  handleChange = (e) => {
    this.setState({ value: e.target.value })
  }

  // 提交
  handleSubmit = (e) => {
    e.preventDefault()
    const { toUserList, fileList, value } = this.state
    const pureText = _.trim(value)
    const newFilelist = fileList.map((d) => ({ fileId: d.fileId, fileName: d.name }))
    var flag
    if (runtimeStore.getState().language === 'zh_cn') {
      flag = /^回复.*:$/.test(pureText)
    } else {
      flag = /^reply.*:$/.test(pureText)
    }
    if (flag || pureText === '') {
      message.error(i18n('ticket.comment.not_empty', '评论不能为空'))
      return false
    }
    // pureText = pureText.replace(/\n/g, '')
    const { commentName, id, parentId, handleOk, setInitialIsReply, replyId, subcomments } =
      this.props
    const commentData = {
      toUserList: toUserList,
      passiveCommentUserName: commentName,
      content: pureText,
      ticketId: id,
      parentId: parentId || '',
      fileList: newFilelist
    }
    handleOk(commentData, this.props.id)
    if (typeof setInitialIsReply === 'function') {
      if (replyId) {
        setInitialIsReply(replyId)
      } else {
        subcomments.forEach((d) => {
          setInitialIsReply(d.commentId)
        })
      }
    }
    this.setState({
      value: '',
      toUserList: [], // @的人员列表
      pureText: '', // 评论的内容
      fileList: []
    })
  }

  searchUser = (value) => {
    this.timer && clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.props.userStore.getCommentUserList(value).then(() => {
        this.forceUpdate()
      })
    }, 500)
  }

  renderUploadData = (info) => {
    const { name, size, type, fileId } = info
    const data = {
      fileName: name,
      fileLength: size,
      contentType: type,
      fileId: fileId,
      outId: this.props.id,
      fileSource: 'ticketCommentFile'
    }
    if (type === '' || type == null) {
      data.contentType = '*/*'
    }
    if (Browser.isIE9()) {
      if (name.match(/.jpg|.jpeg/i)) {
        data.contentType = 'image/jpeg'
      } else if (name.match(/.gif/i)) {
        data.contentType = 'image/gif'
      } else if (name.match(/.png/i)) {
        data.contentType = 'image/png'
      } else if (name.match(/.bmp/i)) {
        data.contentType = 'image/bmp'
      }
    }
    return data
  }

  async removeFileById(fileId) {
    const { id } = this.props
    const res =
      (await axios({
        url: API.deleteFile + `/${fileId}` + `?ticketId=${id}`,
        method: 'post'
        // data: { ticketId: id }
      })) || {}
    return res
  }

  render() {
    const { selectVisible, value } = this.state
    const userList = mobx.toJS(this.props.userStore.commentUserList)
    const canComment = this.props.ticketStore.detailForms.canComment
    const textAreaDom = document.querySelector('#textAreaWithFile')
    const { fileAccept } = this.props.globalStore
    const accept = fileAccept ? fileAccept.join(',') : ''
    const uploadProps = {
      action: API.UPLOAD,
      accept,
      className: 'upload-list-inline',
      onChange: (info) => {
        if (info.file.status !== 'uploading') {
        }
        if (info.file.status === 'done') {
          if (info.file.response.errCode === 3348) {
            const { fileList } = this.state
            const fileName = fileList.find((d) => d.fileId === info.file.fileId).name
            const newFileList = fileList.filter((d) => d.fileId !== info.file.fileId)
            this.setState({ fileList: newFileList })
            message.error(`${fileName}${i18n('upload_error_3')}`)
            return
          }
          const { fileList } = this.state
          const fileName = fileList.find((d) => d.fileId === info.file.fileId).name
          message.success(`${fileName}${i18n('upload_siccess')}`)
        } else if (info.file.status === 'error') {
          const { fileList } = this.state
          const fileName = fileList.find((d) => d.fileId === info.file.fileId).name
          message.error(`${fileName}${i18n('w70006')}`)
          const newFileList = fileList.filter((d) => d.fileId !== info.file.fileId)
          this.setState({ fileList: newFileList })
        }
      },
      data: (info) => this.renderUploadData(info),
      onRemove: async (file) => {
        const res = await this.removeFileById(file.fileId)
        if (res) {
          const { fileList } = this.state
          const index = fileList.indexOf(file)
          const newFileList = fileList.slice()
          newFileList.splice(index, 1)
          this.setState({ fileList: newFileList })
          const fileCount = newFileList.length
          if (fileCount >= 4 && fileCount % 4 === 0) {
            textAreaDom.style.paddingBottom = 30 + (parseInt(fileCount / 4, 10) - 1) * 20 + 'px'
          }
        }
      },
      beforeUpload: (file) => {
        if (file.size > 20 * 1024 * 1024) {
          message.error(i18n('upload_file_too_big', '文件过大'))
          return false
        }
        file.fileId = uuidv4().replaceAll('-', '')
        this.setState(({ fileList }) => ({
          fileList: [...fileList, file]
        }))
        const { fileList } = this.state
        const fileCount = [...fileList, file].length
        if (fileCount > 4 && fileCount % 4 === 1) {
          textAreaDom.style.paddingBottom = 30 + parseInt(fileCount / 4, 10) * 20 + 'px'
        }
      },
      fileList: this.state.fileList
    }
    return (
      <div
        className="comment-box2"
        style={{ display: this.props.showCommentBox ? 'block' : 'none', margin: 0 }}
      >
        <div className="editor-wrap">
          {/* <Editor searchUser={this.searchUser} value={value} onChange={this.handleChange} userList={userList} /> */}
          <TextAreaEditor value={value} onChange={this.handleChange} disabled={!canComment} />
        </div>
        <div className={canComment ? 'abso submit' : 'abso submit disabled'}>
          <button className="comment-btn" onClick={this.handleSubmit} disabled={!canComment}>
            {i18n('globe.submit', '提交')}
          </button>
        </div>
        <div className="upload-btn">
          <Upload {...uploadProps} disabled={!canComment}>
            <a className={canComment ? 'at-btn' : 'at-btn disabled'}>
              <PaperClipOutlined />
            </a>
          </Upload>
        </div>
        <div className="abso at">
          <a className={canComment ? 'at-btn' : 'at-btn disabled'} onClick={this.showSelect}>
            @
          </a>
          {selectVisible && (
            <Select
              showSearch
              labelInValue
              style={style}
              filterOption={false}
              placeholder={i18n('ticket.comment.searchUser', '请搜索选择人员')}
              notFoundContent={i18n('ticket.comment.notfind', '无法找到')}
              onSelect={this.selectChange}
              onSearch={this.searchUser}
              onBlur={this.selectBlur}
            >
              {userList.map((item) => (
                <Option key={item.userId} value={item.userId}>
                  {item.userName}
                </Option>
              ))}
            </Select>
          )}
        </div>
      </div>
    )
  }
}

export default ContentEditable
