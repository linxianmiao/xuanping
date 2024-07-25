import React from 'react'

class UserContent extends React.Component {
  componentDidMount() {
    this.pop.addEventListener('scroll', this.props.handleScroll)
  }

  componentWillUnmount () {
    this.pop.removeEventListener('scroll', this.props.handleScroll)
  }

  render() {
    const { userList } = this.props
    return <div ref={node => { this.pop = node }} className="tooltip_single">
      {
        _.map(userList, user => {
          return <div key={user.userId}>
            <i className="iconfont icon-idcard iClass" />
            <span className="userNameClass">{user.userName}：</span>
            {user.userEmail && <span className="userNameClass">{user.userEmail}</span>}
            {user.mobilePhone && <span className="userNameClass"><span style={{ margin: '0 4px' }}>|</span>{user.mobilePhone}</span>}
          </div>
        })
      }
    </div>
  }
}

export default UserContent
