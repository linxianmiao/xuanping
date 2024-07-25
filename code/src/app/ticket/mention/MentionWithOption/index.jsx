import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Mention, MentionsInput } from 'react-mentions'
import Options from './Options'
import '../styles/indexRoll.less'

@inject('globalStore')
@observer
class MentionWithOption extends Component {
  state = {
    users: []
  }

  handleChange = (e, value) => {
    this.props.handleChange(value)
  }

  handleClick = () => {
    if (this.state.users.length === 0) {
      axios.post(API.USER_LIST_NO_ORG, { ids: '' }).then((data) => {
        const userList = data.map((user) => {
          return {
            userId: user.userId,
            userName: user.userName,
            id: user.userId,
            display: user.userName
          }
        })
        this.setState({
          users: userList
        })
      })
    }
  }

  handleOptionSelect = (text) => {
    this.props.handleChange(text)
  }

  renderSuggestion = (suggestion) => {
    return <div className="user">{suggestion.userName}</div>
  }

  render() {
    const { val, btnInfo } = this.props
    const { users } = this.state
    const customHandlingComments = window.localStorage.getItem('customHandlingComments')
    const btn = btnInfo || {}
    return (
      <div className="multiple-triggers">
        <MentionsInput
          className={btn.name === '确认不通过' ? 'mention-input mention-high' : 'mention-input'}
          placeholder={i18n('please-input', '请输入')}
          displayTransform={(id, display) => '@' + display}
          markup='<a user_id="__id__" >@__display__</a>'
          value={val}
          onChange={this.handleChange}
          onClick={this.handleClick}
        >
          <Mention
            className="mention"
            type="user"
            trigger="@"
            appendSpaceOnAdd
            renderSuggestion={this.renderSuggestion}
            data={users}
          />
        </MentionsInput>

        {customHandlingComments && btn.name !== '确认不通过' && (
          <Options onChange={this.handleOptionSelect} />
        )}
      </div>
    )
  }
}

export function MentionEditor({ value, onChange, ...other }) {
  return <MentionWithOption {...other} val={value} handleChange={onChange} />
}

export default MentionWithOption
