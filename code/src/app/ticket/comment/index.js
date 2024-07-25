import React, { Component } from 'react'
import PropTypes from 'prop-types'
import EachComment from './eachComment'
import ContentEditable from './contentEditable'
import * as mobx from 'mobx'
import { inject, observer } from 'mobx-react'
import './styles/index.less'
@inject('ticketStore')
@observer
class Comment extends Component {
  static contextTypes = {
    ticketId: PropTypes.string.isRequired
  }

  state = {
    expend: false, // 评论内容的展开与收起
    to: {
      name: '',
      id: '',
      privateKey: 0
    }
  }

  componentDidMount() {
    if (this.props.source !== 'formset') {
      this.getCommentList()
    }
  }

  getCommentList = () => {
    // 根据工单id获取评论列表
    this.props.ticketStore.getCommentList(this.props.id)
  }

  // 控制评论列表的展开收起 ， 评论最少显示两个
  expendComment = () => {
    this.setState({ expend: !this.state.expend })
  }

  // 获取评论列表
  getcommentArrray = () => {
    const commentList = mobx.toJS(this.props.ticketStore.commentList)
    const commentArrray = []
    // i < 2 ? true : this.state.expend === 开始的时候展示两行评论，其他的隐藏
    _.map(commentList, (item, index) => {
      commentArrray.push(
        <EachComment
          key={item.commentId}
          commentList={commentList}
          commentId={item.commentId}
          id={this.props.id}
          handleOk={this.handleOk}
          comment={item}
          handleClick={this.handleClick}
          tacheId={this.props.tacheId}
          expend={index < 2 ? true : this.state.expend}
          handleDelete={this.handleDelete}
        />
      )
    })
    return commentArrray
  }

  // 提交评论
  handleOk = (data) => {
    const postData = data
    postData.activityId = this.props.tacheId
    axios.post(API.POST_COMMENT, postData).then((data) => {
      this.getCommentList()
      this.props.ticketStore.getTicketDetailTabCounts(this.context.ticketId)
    })
  }

  // 删除评论
  handleDelete = (id) => {
    axios.post(API.DELETECOMMENTBYID(id)).then(() => {
      this.getCommentList()
      this.props.ticketStore.getTicketDetailTabCounts(this.context.ticketId)
    })
  }

  render() {
    const { expend } = this.state
    const commentArrray = this.getcommentArrray()
    const commentList = mobx.toJS(this.props.ticketStore.commentList)
    return (
      <div className="comment-wrap">
        <div className="top-comment-box">
          <ContentEditable
            showCommentBox="false"
            id={this.props.id}
            to={this.state.to}
            handleOk={this.handleOk}
            formMode={this.props.formMode}
          />
        </div>
        {Array.isArray(commentList) && commentList.length !== 0 && (
          <div className="comment-content">
            <ul className="ticket-comment"> {commentArrray} </ul>
            <div
              style={{ display: commentList.length > 2 ? 'inline-block' : 'none' }}
              className="expend-comment no-select"
              onClick={this.expendComment}
            >
              <a>
                {!expend && i18n('ticket.comment.unfold', '展开评论')}
                {expend && i18n('ticket.comment.stop', '收起评论')}
              </a>
              <i
                className={!expend ? 'iconfont icon-xiatui' : 'iconfont icon-xiatui iconXiatui'}
                aria-hidden="true"
              />
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default Comment
