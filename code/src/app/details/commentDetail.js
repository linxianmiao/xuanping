import React from 'react'
import { Rate } from '@uyun/components'

export default class CommentDetail extends React.Component {
  render () {
    const { record } = this.props
    return (
      <div className="ticket-comment" style={{ height: 96 }}>
        <div className="star">{i18n('my.evaluate')} : &nbsp;&nbsp; <Rate disabled value={record.star} /></div>
        <p className="comment">{record.comment}</p>
      </div>
    )
  }
}