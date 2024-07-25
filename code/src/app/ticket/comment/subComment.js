import React, { Component } from 'react'
import moment from 'moment'
import { store as runtimeStore } from '@uyun/runtime-react'

class SubComment extends Component {
  state = {
    isMain: !this.props.comment.parentId
  }

  componentDidMount() {
    this.props.setInitialIsReply(this.props.replyId)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.replyId !== this.props.replyId) {
      this.props.setInitialIsReply(nextProps.replyId)
    }
  }

  handleOk = (html, id) => {
    this.props.handleOk(html, id)
  }

  handleClick = (txt, commentedName) => {
    const {
      setCommentedName,
      commentList,
      setInitialIsReply,
      replyId,
      setIsReply,
      handleClick,
      comment
    } = this.props
    if (txt === 'reply') {
      // 如果点另一条回复，其他的取消全都变成回复
      setCommentedName(commentedName)
      commentList.forEach((d) => {
        if (d.commentId !== replyId) {
          setInitialIsReply(d.commentId)
        }
      })
    }
    setIsReply(replyId)
    handleClick(this.state.isMain, comment.criticsName, comment.criticsId, comment.commentId, txt)
  }

  handleDelete = () => {
    this.props.handleDelete(this.state.isMain, this.props.comment.commentId)
  }

  download(e, d) {
    // console.log('调用下载接口')
    e.stopPropagation()
    if (d.fileName && d.fileId) {
      const a = document.createElement('a')
      a.href = `${API.DOWNLOAD}/${d.fileId}/${d.fileName}`
      a.target = '_blank'
      a.download = d.fileName

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

  render() {
    const subComment = this.props.comment
    const { isReply } = this.props
    const { criticsName, passiveCommentUserName } = subComment
    const commentPeple = passiveCommentUserName
      ? `${criticsName}回复${passiveCommentUserName}:`
      : `${criticsName}:`
    return (
      <li style={{ marginLeft: this.state.isMain ? '0' : '40px' }}>
        <div className="left" style={{ width: 'inherit' }}>
          <div className="gravata">
            {subComment.criticsName ? subComment.criticsName.charAt(0) : ''}
          </div>
        </div>
        <div className="content">
          <div className="top">
            <span className="comment-people">{commentPeple}</span>
            <span className="break-word time">
              ({moment(subComment.commentTime).format('YYYY-MM-DD HH:mm')})
            </span>
          </div>
          <div className="bottom">
            <div
              className={subComment.deleteFlag ? 'deleteTxt' : ''}
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {subComment.commentDetail}
            </div>
            <div className="fileListWrap">
              {subComment.commentFiles &&
                subComment.commentFiles.map((d) => (
                  <a onClick={(e) => this.download(e, d)} style={{ marginRight: 20 }}>
                    {d.fileName}
                  </a>
                ))}
            </div>
            {!this.props.showall &&
              !subComment.deleteFlag &&
              (isReply ? (
                <a onClick={() => this.handleClick('reply', subComment.criticsName)}>
                  {i18n('ticket.comment.reply')}
                </a>
              ) : (
                <a onClick={() => this.handleClick('cancel')}>{i18n('cancel')}</a>
              ))}
            {runtimeStore.getState().user?.userId === subComment.criticsId &&
              !subComment.deleteFlag && (
                <a onClick={this.handleDelete}>
                  <i className="iconfont icon-shanchu ml10" />
                </a>
              )}
          </div>
        </div>
      </li>
    )
  }
}
export default SubComment
