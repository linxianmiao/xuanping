import React, { Component } from 'react'
import { inject } from 'mobx-react'
import PropTypes from 'prop-types'
import { DownOutlined, UpOutlined } from '@uyun/icons';
import { Icon } from '@uyun/components'
import ContentEditable from './contentEditable'
import SubComment from './subComment'

@inject('ticketStore')
class EachComment extends Component {
  state = {
    showMore: this.props.comment.subCount > 0,
    showCommentBox: false,
    showCommentBox1: false,
    to: {
      name: '',
      id: '',
      privateKey: 0
    },
    subComment: [],
    down: true,
    commentName: ''
  }

  static contextTypes = {
    ticketId: PropTypes.string.isRequired
  }

  setIsReply(id) {
    this.setState(prevState => ({ ['isReply' + id]: !prevState['isReply' + id] }))
  }

  setInitialIsReply(id) {
    this.setState({ ['isReply' + id]: true })
  }

  showMoreDetail = (commentId, txt) => {
    if (txt === 'expand') {
      axios.get(API.SUBCOMMENT(commentId)).then(data => {
        this.setInitialIsReply(commentId)
        this.props.ticketStore.getCommentList(this.context.ticketId)
        this.setState(preState => ({
          showMore: true,
          subComment: data,
          showCommentBox: false,
          showCommentBox1: false,
          down: !preState.down
        }))
      })
    } else {
      this.setInitialIsReply(commentId)
      this.setState(preState => ({
        showMore: this.props.comment.subCount > 0,
        subComment: [],
        showCommentBox: false,
        showCommentBox1: false,
        down: !preState.down
      }))
    }
  }

  // 点击以后出现评论框 type 标识是否是一级评论
  handleClick = (type, name, id, commentId, txt) => {
    const stateData = {
      to: {
        name: name,
        id: id,
        privateKey: commentId
      }
    }
    if (type) {
      if (txt === 'reply') {
        stateData.showCommentBox = true
        stateData.showCommentBox1 = false
      } else {
        stateData.showCommentBox = false
        stateData.showCommentBox1 = false
      }
    } else {
      if (txt === 'reply') {
        stateData.showCommentBox = false
        stateData.showCommentBox1 = true
      } else {
        stateData.showCommentBox = false
        stateData.showCommentBox1 = false
      }
    }

    this.setState(stateData)
  }

  // 删除评论
  handleDelete = (type, id) => {
    if (type) {
      this.props.handleDelete(id)
    } else {
      axios.post(API.DELETECOMMENTBYID(id)).then(() => {
        this.showMoreDetail(this.props.commentId, 'expand')
        this.props.ticketStore.getTicketDetailTabCounts(this.context.ticketId)
      })
    }
  }

  // 提交子评论
  handleOk = (data, id) => {
    if (data.parentId !== '') {
      const postData = data
      postData.activityId = this.props.tacheId
      axios.post(API.POST_COMMENT, postData).then(() => {
        this.showMoreDetail(this.props.commentId, 'expand')
        this.props.ticketStore.getTicketDetailTabCounts(this.context.ticketId)
      })
    } else {
      this.props.handleOk(data, id)
    }
  }

  setCommentedName = val => {
    this.setState({ commentName: val })
  }

  render() {
    const { down, commentName } = this.state
    const { id, comment, showall, commentId, commentList } = this.props
    return (
      <li style={{ display: this.props.expend ? 'block' : 'none' }}>
        <div className="comment">
          <ul>
            <SubComment
              key={comment.commentId}
              replyId={comment.commentId}
              id={id}
              comment={comment}
              handleOk={this.handleOk}
              commentList={commentList}
              setCommentedName={this.setCommentedName}
              handleClick={this.handleClick}
              handleDelete={this.handleDelete}
              showall={showall}
              setIsReply={id => this.setIsReply(id)}
              setInitialIsReply={id => this.setInitialIsReply(id)}
              isReply={this.state['isReply' + comment.commentId]}
            />
            <li>
              <ContentEditable
                showCommentBox={this.state.showCommentBox}
                commentName={commentName}
                setInitialIsReply={id => this.setInitialIsReply(id)}
                replyId={comment.commentId}
                id={this.props.id}
                to={this.state.to}
                parentId={this.props.comment.commentId}
                handleOk={this.handleOk}
              />
            </li>
          </ul>
          <span className="show-more" style={{ display: this.state.showMore ? 'block' : 'none' }}>
            <i className="iconfont icon-xiayiji" aria-hidden="true" />
            <a href="javascript:void(0)">
              {this.props.comment.subCount}
              {down ? (
                <DownOutlined
                  onClick={() => {
                    this.showMoreDetail(commentId, 'expand')
                  }} />
              ) : (
                <UpOutlined
                  onClick={() => {
                    this.showMoreDetail(commentId, 'cancel')
                  }} />
              )}
            </a>
          </span>
          <ul style={{ display: !this.state.down ? 'block' : 'none' }}>
            {_.map(this.state.subComment, item => {
              return (
                <SubComment
                  key={item.commentId}
                  replyId={item.commentId}
                  setCommentedName={this.setCommentedName}
                  commentList={this.state.subComment}
                  id={this.props.id}
                  isReply={this.state['isReply' + item.commentId]}
                  setIsReply={id => this.setIsReply(id)}
                  setInitialIsReply={id => this.setInitialIsReply(id)}
                  comment={item}
                  handleOk={this.handleOk}
                  handleClick={this.handleClick}
                  handleDelete={this.handleDelete}
                  showall={showall}
                />
              )
            })}
            <li style={{ marginLeft: '40px' }}>
              <ContentEditable
                setInitialIsReply={id => this.setInitialIsReply(id)}
                subcomments={this.state.subComment}
                commentName={commentName}
                showCommentBox={this.state.showCommentBox1}
                id={this.props.id}
                to={this.state.to}
                handleOk={this.handleOk}
                parentId={
                  this.state.subComment.length !== 0 ? this.state.subComment[0].parentId : ''
                }
              />
            </li>
          </ul>
        </div>
      </li>
    );
  }
}

export default EachComment
