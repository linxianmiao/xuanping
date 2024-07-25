import React, { Component } from 'react'
import { Mention, MentionsInput } from 'react-mentions'
import Options from './Options'
import axios from 'axios'
import './indexRoll.less'

class MentionEditor extends Component {
  state = {
    users: []
  }

  handleChange = (e, value) => {
    this.props.onChange(value)
  }

  handleClick = () => {
    if (this.state.users.length === 0) {
      axios
        .post('/itsm/api/v2/config/userGroup/getUsersWithoutCarryOrg', { ids: '' })
        .then((res) => {
          const userList = res.data.data.map((user) => {
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
    this.props.onChange(text)
  }

  renderSuggestion = (suggestion) => {
    return <div className="user">{suggestion.userName}</div>
  }

  render() {
    const { value, btnInfo } = this.props
    const { users } = this.state
    const customHandlingComments = window.localStorage.getItem('customHandlingComments')
    const btn = btnInfo || {}
    return (
      <div className="multiple-triggers">
        <MentionsInput
          className={btn.name === '确认不通过' ? 'mention-input mention-high' : 'mention-input'}
          placeholder={'请输入'}
          displayTransform={(id, display) => '@' + display}
          markup='<a user_id="__id__" >@__display__</a>'
          value={value}
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

export default MentionEditor
