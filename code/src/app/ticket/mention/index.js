import React, { Component } from 'react'
import { Mention, MentionsInput } from 'react-mentions'
import './styles/indexRoll.less'

class MentionEditor extends Component {
    handleChange = (event, value, pureText, mentions) => {
      this.props.onChange(value, pureText, mentions)
    }

    // 接受一个函数提到定制显示的字符串
    transformDisplay (id, display) {
      return `@${display}`
    }

    renderSuggestion = user => {
      return <div className="user" key={user.id}>{user.display}</div>
    }

    render () {
      const userList = this.props.userList.map(user => {
        return {
          id: user.userId,
          display: user.userName
        }
      })

      return (
        <div className="multiple-triggers">
          <MentionsInput
            value={this.props.value}
            onChange={this.handleChange}
            className="mention-input"
            displayTransform={this.transformDisplay}
            markup='<a user_id="__id__" >@__display__</a>'
            placeholder={i18n('ticket.comment.metion.placeholder', '请输入您的评论内容！')}>
            <Mention
              className="mention"
              type="user"
              trigger="@"
              appendSpaceOnAdd
              data={userList}
              renderSuggestion={this.renderSuggestion} />
          </MentionsInput>
        </div>
      )
    }
}

export default MentionEditor
