import React, { Component } from 'react'
import { Button, Rate, Input, Modal } from '@uyun/components'
import { inject, observer } from 'mobx-react'
const TextArea = Input.TextArea

@inject('ticketStore')
@observer
export default class CommentButton extends Component {
  state = {
    commentVisible: false,
    star: 5,
    starDesc: `5 ${i18n('star')}`,
    comment: ''
  }

  componentDidMount() {
    this.checkTicketCommon(this.props.ticketId)
  }

  componentDidUpdate(prevProps) {
    if (this.props.ticketId !== prevProps.ticketId) {
      this.checkTicketCommon(this.props.ticketId)
    }
  }

  checkTicketCommon = (ticketId) => {
    if (ticketId) {
      this.props.ticketStore.isTicketComment(ticketId)
    }
  }

  // 评论等级描述
  getStarDesc = (num, type) => {
    switch (num) {
      case 5:
        return this.setState({
          starDesc: type === 'hover' ? i18n('star5', '非常满意') : `5 ${i18n('star', '星')}`
        })
      case 4:
        return this.setState({
          starDesc: type === 'hover' ? i18n('star4', '满意') : `4 ${i18n('star')}`
        })
      case 3:
        return this.setState({
          starDesc: type === 'hover' ? i18n('star3', '一般') : `3 ${i18n('star')}`
        })
      case 2:
        return this.setState({
          starDesc: type === 'hover' ? i18n('star2', '不满意') : `2 ${i18n('star')}`
        })
      case 1:
        return this.setState({
          starDesc: type === 'hover' ? i18n('star1', '极不满意') : `1 ${i18n('star')}`
        })
    }
  }

  onHoverChange = num => {
    const { star } = this.state
    if (num) {
      this.getStarDesc(num, 'hover')
    } else {
      this.getStarDesc(star)
    }
  }

  commentSave = () => {
    const { star, comment } = this.state
    const { ticketId } = this.props
    const params = {
      ticketId,
      star,
      comment
    }
    this.props.ticketStore.commentSave(params)
    this.setState({ commentVisible: false })
  }

  render() {
    const { isComment, ticketComment } = this.props.ticketStore
    const { commentVisible, star, starDesc } = this.state
    const { fromSrv, isFinish, hasComment, isTicketCreator } = isComment || {}
    const commentDisabled = hasComment || ticketComment.length > 0
    return (
      <React.Fragment>
        {
          (fromSrv && isFinish && isTicketCreator) &&
          <Button disabled={commentDisabled} onClick={() => this.setState({ commentVisible: true })}>{commentDisabled ? i18n('evaluated', '已评') : i18n('evaluate', '评价')}</Button>
        }

        <Modal
          title={i18n('evaluate', '评价')}
          visible={commentVisible}
          onOk={this.commentSave}
          onCancel={() => this.setState({ commentVisible: false })}
          size="small"
        >
          <React.Fragment>
            <Rate
              style={{ marginBottom: 10 }}
              onChange={value => this.setState({ star: value }, () => this.getStarDesc(value))}
              onHoverChange={this.onHoverChange}
              value={star}
              allowClear={false}
            />
            <span className="u4-rate-text">{starDesc}</span>
            <TextArea placeholder={i18n('comment.placeholder', '请输入评价内容')} rows={4} maxLength={50} onChange={e => this.setState({ comment: e.target.value })} />
          </React.Fragment>
        </Modal>
      </React.Fragment>

    )
  }
}
