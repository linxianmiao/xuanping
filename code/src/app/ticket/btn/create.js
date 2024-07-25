import React, { Component } from 'react'
import { Button, Menu, Tooltip, Dropdown, Modal } from '@uyun/components'
import TicketCreate from './operate/create'
import TicketJump from './operate/jump'
import SeniorJump from './operate/seniorJump'
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 18 }
}
class CreateBtn extends Component {
  state = {
    visible: '',
    list: []
  }

  componentDidMount() {}

  // 创建工单弹框
  handleCreate = () => {
    // policy 1 === 上一处理人指定 ； 2 === 创建人指定
    this.props.validate(formsData => {
      const { taches } = this.props
      const list = []
      _.map(taches, (tache, index) => {
        if (tache.tacheType === 1) {
          _.map(tache.parallelismTaches, parall => {
            if ((index === 1 && parall.policy === 1) || parall.policy === 2) {
              list.push(parall)
            }
          })
        } else {
          if ((index === 1 && tache.policy === 1) || tache.policy === 2) {
            list.push(tache)
          }
        }
      })
      this.setState({
        visible: 'create',
        list
      })
    })
  }

  // 跳转工单弹框
  handleJump = () => {
    this.setState({
      visible: 'jump'
    })
  }

  handleCancel = () => {
    this.setState({ visible: '' })
  }

  _render = () => {
    const { activitys } = this.props
    const btns = []
    const menus = []
    _.map(activitys.ruleVos, (activity, index) => {
      if (activity.ruleType === 1) {
        // 独立显示
        if (activity.type === 1) {
          // 跳转
          btns.push(
            <Button
              key={index}
              className="create-btn"
              type="primary"
              onClick={() => {
                this.ticketJumpShow(activity)
              }}
            >
              {activity.name}
            </Button>
          )
        }
      } else if (activity.ruleType === 0) {
        if (activity.type === 1) {
          menus.push(<Menu.Item key={index}>{activity.name}</Menu.Item>)
        }
      }
    })

    return { btns, menus }
  }

  render() {
    const { operateType } = this.props
    const { visible, list } = this.state
    const { activitys } = this.props
    const { btns, menus } = this._render()
    const menu = <Menu onClick={this.dispatchMenu}>{menus}</Menu>
    const dilver = {
      list,
      formItemLayout
    }
    return (
      <div>
        <Tooltip placement="left" title={activitys.submitName}>
          {menus.length === 0 ? (
            <Button onClick={this.handleCreate} type="primary" className="create-btn">
              {i18n('ticket.create.confirm_creation', '确认创建')}
            </Button>
          ) : (
            <Dropdown.Button
              type="primary"
              overlay={menu}
              className="create-btn"
              onClick={this.handleCreate}
            >
              {i18n('ticket.create.confirm_creation', '确认创建')}
            </Dropdown.Button>
          )}
        </Tooltip>
        {btns}
        {operateType === 'itsm' && (
          <Button type="primary" onClick={this.ticketSave}>
            {i18n('globe.save', '保存')}
          </Button>
        )}
        <Modal title={i18n('ticket.create.create_ticket', '创建工单')}>
          visible={!!visible}
          maskClosable={false}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          {visible === 'create' && (
            <TicketCreate
              isCreate
              ref={node => {
                this.create = node
              }}
              setFlowUser={this.setFlowUser}
              modelId={this.props.forms.modelId}
              showDepart={1}
              activitys={this.state.activitys}
            />
          )}
          {visible === 'jump' && this.state.modelRule && this.state.modelRule.modelType ? (
            <SeniorJump
              isCreate
              ref={node => {
                this.jump = node
              }}
              ticketType="create"
              setFlowUser={this.setFlowUser}
              visible={this.state.ticketJumpVisible}
              id={this.props.forms.ticketId}
              tache={this.state.currentJump}
              modelType={this.state.modelRule && this.state.modelRule.modelType}
              modelId={this.props.forms.modelId}
              activitys={this.state.activitys}
              showDepart={1} // 开启组织机构时 只有新建或跳转 才显示 部门下拉框
            />
          ) : visible === 'jump' ? (
            <TicketJump
              isCreate
              ref={node => {
                this.jump = node
              }}
              ticketType="create"
              setFlowUser={this.setFlowUser}
              visible={this.state.ticketJumpVisible}
              id={this.props.forms.ticketId}
              tache={this.state.currentJump}
              modelType={this.state.modelRule && this.state.modelRule.modelType}
              modelId={this.props.forms.modelId}
              activitys={this.state.activitys}
              showDepart={1} // 开启组织机构时 只有新建或跳转 才显示 部门下拉框
            />
          ) : null}
        </Modal>
      </div>
    )
  }
}
export default CreateBtn
