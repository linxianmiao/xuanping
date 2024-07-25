import React, { Component } from 'react'
import { Tag, Modal } from '@uyun/components'
import UserSystem from '../users/userSystem'

class UserValue extends Component {
    state = {
      visible: false
    }

    addUser = values => {
      this.props.onChange(values)
      this.setState({ visible: false })
    }

    onOpen = () => {
      this.setState({ visible: true })
    }

    onClose = () => {
      this.setState({ visible: false })
    }

    onDelete = (e, id) => {
      e.stopPropagation()
      const users = _.filter(this.props.value, o => o.userId !== id)
      this.props.onChange(users)
    }

    render () {
      const { value } = this.props
      const { visible } = this.state
      const diliver = {
        status: { status1: 1, status2: 1, status3: 0 },
        opt: 0
      }
      return (
        <div>
          <div className="condition-user-wrap" onClick={this.onOpen}>
            { (value && value.length > 0) && _.map(value, item => {
              return <Tag key={item.userId} closable onClose={e => { this.onDelete(e, item.userId) }}>{item.userName}</Tag>
            })
            }
          </div>
          { visible && <Modal visible={visible}
            footer={false}
            wrapClassName="add-user-modal"
            width={620}
            onCancel={this.onClose}
          >
            <UserSystem selectedData={value}
              onOk={this.addUser}
              onCancel={this.onClose}
              {...diliver}
            />
          </Modal>
          }

        </div>

      )
    }
}

export default UserValue
