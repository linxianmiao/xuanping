/**
 * 人员范围组件
 */

import React, { Component } from 'react'
import UserSystem from '../../../../users/userSystem'
import '../../style/countersign.less'
import { Modal, Tag } from '@uyun/components'

class CounterSign extends Component {
  constructor (props) {
    super(props)
    this.state = {
      visible: false
    }
  }

    showModal = () => {
      this.setState({
        visible: true
      })
    }

    addUserOk = data => {
      this.setState({ visible: false })
      this.props.getUserData && this.props.getUserData(data)
    }

    addUserCancel = () => {
      this.setState({ visible: false })
    }

    handlerCloseTag = (e, id) => {
      e.stopPropagation()
      const { value } = this.props
      const users = _.filter(value, o => o.userId !== id && o.groupId !== id)
      this.props.getUserData && this.props.getUserData(users)
    }

    render () {
      const userConfig = { status: { status1: 1, status2: 0, status3: 0 }, opt: 0, assign: 1 }
      const { visible } = this.state
      const { value } = this.props
      return (
        <div className="counter-sign-wrap" >
          <div
            className="tagIput"
            onClick={this.showModal}
          >
            {!_.isEmpty(value) && value.map(item => {
              const id = item.userId || item.groupId
              return (
                <Tag
                  key={id}
                  closable
                  onClose={e => { this.handlerCloseTag(e, id) }}
                >{item.userName || item.groupName}</Tag>
              )
            })}
          </div>
          { visible && <Modal
            visible={visible}
            maskClosable={false}
            onCancel={this.addUserCancel}
            width={620}
            footer={''}
            className="mymodelstyle"
          >
            <UserSystem
              onCancel={this.addUserCancel}
              onOk={this.addUserOk}
              title="人员范围"
              selectedData={_.cloneDeep(value) || []}
              {...userConfig}
            />
          </Modal>}
        </div>
      )
    }
}

export default CounterSign
