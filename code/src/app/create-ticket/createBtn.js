import React, { Component } from 'react'
import { Button, Dropdown, Menu, Modal, Tooltip } from '@uyun/components'

import TicketJump from '../ticket/btn/operate/jump'
import TicketCreate from '../ticket/btn/operate/create'

export default class CreateBtn extends Component {
  constructor(props) {
    super(props)
    this.flowusers = null
    this.state = {
      modelRule: null, // 创建页模型规则
      menuItemList: [], // 合并显示下拉菜单内容
      menuItem: [], // 合并显示下拉菜单组件
      buttonList: [], // 独立显示 按钮
      ticketCreateVisible: false, // 创建工单模态框
      ticketJumpVisible: false, // 跳转模态框
      currentJump: {}, // 发起跳转时对应跳转环节信息
      activitys: [], // 所有环节信息
      visible: true,
      isSuccess: true,
      formData: {}
    }
  }

  componentDidMount() {
    this.setState({
      visible: this.state.visible ? this.state.visible : this.props.visible
    })

    // 获取第一环节信息
    this.props.id && this.getFirstActivity(this.props.id)
  }

  componentWillUpdate(nextProps) {
    // 设置创建按钮是否可用
    if (this.props.visible !== nextProps.visible) {
      this.setState({
        visible: nextProps.visible
      })
    }

    // 模型id不一致的情况下, 且nextProps.id 存在的时候清空state数据
    if (this.props.id !== nextProps.id && nextProps.id) {
      this.setState({
        modelRule: null, // 创建页模型规则
        menuItemList: [], // 合并显示下拉菜单内容
        menuItem: [], // 合并显示下拉菜单组件
        buttonList: [], // 独立显示 按钮

        ticketJumpVisible: false, // 跳转模态框
        ticketCreateVisible: false, //

        currentJump: {}, // 发起创建并跳转时选中的跳转项 跳转规则
        activitys: []
      })
      // 重新获取第一环节信息
      this.getFirstActivity(nextProps.id)
    }
  }

  /**
   * 获取第一环节数据并组合流程规则数据
   * @Author FB
   * @param  {[type]} id [模型id]
   * @return {[type]}    [第一环节数据]
   */
  getFirstActivity = (id) => {
    // 获取所有环节，用于创建提交时 判断由创建人指定的执行人环节
    axios.get(API.TACHE(id)).then((data) => {
      // 这里存储全部环节数据
      // 点击创建按钮时遍历这个数组 判断哪些由创建人指定
      const activityTemp = []
      _.map(data, (item, index) => {
        const temp = {}
        if (item.tacheType === 1) {
          _.map(item.parallelismTaches, (i) => {
            // 并行环节数据
            const parallelismTacheTemp = {}
            parallelismTacheTemp.tacheId = i.tacheId
            parallelismTacheTemp.policy = i.policy
            parallelismTacheTemp.isCountersign = i.isCountersign
            parallelismTacheTemp.tacheName = i.tacheName
            parallelismTacheTemp.users = i.users
            parallelismTacheTemp.groups = i.groups
            parallelismTacheTemp.index = index
            activityTemp.push(parallelismTacheTemp)
          })
        } else {
          temp.tacheId = item.tacheId
          temp.policy = item.policy
          temp.tacheName = item.tacheName
          temp.users = item.users
          temp.groups = item.groups
          temp.isCountersign = item.isCountersign
          temp.index = index
          activityTemp.push(temp)
          // 开始节点接子流程，子流程里选人由创建人指定
        }
      })
      this.setState({
        activitys: activityTemp
      })
    })
    axios.get(API.GET_FIRST_ACTIVITY(id)).then((data) => {
      // 循环模型规则 重新组合合并显示的按钮内容并按类型区分
      const menuItemListTemp = []
      _.map(data.ruleVos, (item) => {
        // 循环模型规则
        if (item.type === 1) {
          // type为1 跳转环节
          menuItemListTemp.push({
            flag: 'jump',
            id: item.jumpTache.tacheId,
            name: item.name,
            users: item.jumpTache.users,
            groups: item.jumpTache.groups,
            isCountersign: item.jumpTache.isCountersign,
            policy: item.jumpTache.policy,
            ruleType: item.ruleType,
            tacheType: item.jumpTache.tacheType,
            parallelismTaches: item.jumpTache.parallelismTaches,
            activityFlowId: item.jumpTache.activityFlowId // 高级模型的时候使用的线id
          })
        }
      })
      // 模型规则和合并显示按钮状态
      this.setState({ modelRule: data, menuItemList: menuItemListTemp })
    })
  }

  /* ------------点击合并显示的按钮所做操作，根据按钮key区分--------------- */
  dispatchMenu = (item) => {
    // 所点击的下拉按钮序号，据此获得按钮对应操作
    var index = _.findIndex(this.state.menuItemList, function (chr) {
      return chr.id === item.key.substring(4, item.key.length)
    })

    // 操作类型
    var type = this.state.menuItemList[index].flag
    // 按钮对应内容
    var current = this.state.menuItemList[index]
    // 跳转工单做表单必填校验
    if (type === 'jump') {
      current.tacheId = current.id
      this.ticketJumpShow(current, 'jump')
    }
  }

  setFlowUser = (item, type, initialValue) => {
    // item。code 存在的时候是并行组
    let flowusers = null
    const oldflowusers = _.cloneDeep(this.flowusers)
    if (item.type === 'parallel') {
      // 并行组的时候
      if (type === 'user') {
        flowusers = _.merge({}, oldflowusers, {
          parallelismTacheUser: { [item.code]: initialValue }
        })
        flowusers.parallelismTacheUser[item.code] = initialValue
      } else if (type === 'userGroup') {
        flowusers = _.merge({}, oldflowusers, {
          parallelismTacheGroup: { [item.code]: initialValue }
        })
        flowusers.parallelismTacheGroup[item.code] = initialValue
      }
    } else if (item.type === 'normal') {
      // 一般状态下
      if (type === 'user') {
        flowusers = _.merge({}, oldflowusers, { userList: initialValue })
        flowusers.userList = initialValue
      } else if (type === 'userGroup') {
        flowusers = _.merge({}, oldflowusers, { groupList: initialValue })
        flowusers.groupList = initialValue
      }
    } else if (item.type === 'create') {
      // 创建状态下
      if (type === 'user') {
        flowusers = _.merge({}, oldflowusers, {
          executorAndGroup: { [item.code]: { user: initialValue } }
        })
        flowusers.executorAndGroup[item.code].user = initialValue
      } else if (type === 'userGroup') {
        flowusers = _.merge({}, oldflowusers, {
          executorAndGroup: { [item.code]: { group: initialValue } }
        })
        flowusers.executorAndGroup[item.code].group = initialValue
      }
    } else if (item.type === 'reassign') {
      // 改派状态下
      if (type === 'user') {
        flowusers = _.merge({}, oldflowusers, {
          currexcutor: _.isEmpty(initialValue) ? undefined : `${initialValue[0]}`
        })
        flowusers.currexcutor = _.isEmpty(initialValue) ? undefined : `${initialValue[0]}`
      } else if (type === 'userGroup') {
        flowusers = _.merge({}, oldflowusers, {
          currGroup: _.isEmpty(initialValue) ? undefined : `${initialValue[0]}`
        })
        flowusers.currGroup = _.isEmpty(initialValue) ? undefined : `${initialValue[0]}`
      }
    } else if (item.type === 'paralleljump') {
      if (type === 'user') {
        flowusers = _.merge({}, oldflowusers, {
          executorAndGroup: { [item.code]: { user: initialValue } }
        })
        flowusers.executorAndGroup[item.code].user = initialValue
      } else if (type === 'userGroup') {
        flowusers = _.merge({}, oldflowusers, {
          executorAndGroup: { [item.code]: { group: initialValue } }
        })
        flowusers.executorAndGroup[item.code].group = initialValue
      }
    } else if (item.type === 'createjump') {
      if (type === 'user') {
        flowusers = _.merge({}, oldflowusers, { groupAndUserIds: { user: initialValue } })
        flowusers.groupAndUserIds.user = initialValue
      } else if (type === 'userGroup') {
        flowusers = _.merge({}, oldflowusers, { groupAndUserIds: { group: initialValue } })
        flowusers.groupAndUserIds.group = initialValue
      }
    }
    // let flowusers = {}
    // if (type === 'user') {
    //   flowusers = {
    //     executorAndGroup: {[item.code]: {user: initialValue}}
    //   }
    // } else if (type === 'userGroup') {
    //   flowusers = {
    //     executorAndGroup: {[item.code]: {group: initialValue}}
    //   }
    // }
    this.flowusers = _.cloneDeep(flowusers)
  }

  // 独立显示的跳转按钮 点击事件
  ticketJumpShow = (item, type) => {
    this.props.validate(
      (formsData) => {
        var jumpActivity = {} // 跳转环节的数据
        if (type === 'jump') {
          jumpActivity = item
        } else {
          // 设置传入模态框的值
          jumpActivity.id = item.jumpTache.tacheId // 跳转环节id，当跳转环节为并行组时无效
          jumpActivity.tacheId = item.jumpTache.tacheId
          jumpActivity.title = item.name
          jumpActivity.name = item.jumpTache.tacheName // 跳转环节名称，当跳转环节为并行组时无效
          jumpActivity.users = item.jumpTache.users // 跳转环节可选用户，当跳转环节为并行组时无效
          jumpActivity.groups = item.jumpTache.groups // 跳转环节可选用户组，当跳转环节为并行组时无效
          jumpActivity.policy = item.jumpTache.policy // 跳转环节执行策略，当跳转环节为并行组时无效
          jumpActivity.tacheType = item.jumpTache.tacheType // 环节类型 0-普通环节 1-并行组
          jumpActivity.parallelismTaches = item.jumpTache.parallelismTaches // 并行组内的环节数组 为跳转组件选择跳转环节人员使用
          jumpActivity.isCountersign = item.jumpTache.isCountersign || 0
          jumpActivity.activityFlowId = item.activityFlowId // 高级模型的时候使用的线id
        }
        if (
          this.props.operateType === 'createTicket' ||
          this.props.operateType === 'createTicketAlert' ||
          this.props.operateType === 'createRelateTicket'
        ) {
          let flat = false
          _.forEach(this.state.activitys, (activity) => {
            if (activity.policy === 2) {
              flat = true
              return false
            }
          })
          const activityTemp = []
          item.childModel &&
            _.map(item.childModel.tacheVoList, (tacheVoListItem, ind) => {
              if (tacheVoListItem.policy === 2) {
                flat = true
                const tmp = {}
                tmp.tacheId = tacheVoListItem.tacheId // 子流程里各节点id
                tmp.policy = tacheVoListItem.policy
                tmp.isCountersign = tacheVoListItem.isCountersign
                tmp.tacheName = tacheVoListItem.tacheName
                tmp.users = tacheVoListItem.users
                tmp.groups = tacheVoListItem.groups
                tmp.index = ind
                tmp.subModelId = item.childModel.id
                tmp.parentTacheId = item.jumpTache.tacheId // 开始节点接子流程是，子流程的环节id
                activityTemp.push(tmp)
              }
            })
          this.setState({
            activitysList: _.concat(this.state.activitys, activityTemp)
          })
          if (
            jumpActivity.tacheType === 0 &&
            (jumpActivity.policy === 1 || jumpActivity.policy === 2)
          ) {
            flat = true
          }
          if (jumpActivity.tacheType === 1) {
            _.forEach(jumpActivity.parallelismTaches, (tache) => {
              if (tache.policy === 1 || tache.policy === 2) {
                flat = true
                return false
              }
            })
          }
          if (!flat) {
            this.setState(
              {
                currentJump: jumpActivity
              },
              () => {
                this.ticketJump()
              }
            )
          } else {
            // 高级流程的时候进行变量初始化
            this.setState({
              ticketJumpVisible: true,
              currentJump: jumpActivity
            })
          }
        } else {
          const submodelData = {
            formsData: formsData,
            subTicketId: this.props.forms.ticketId,
            jumpActivity: jumpActivity
          }
          this.props.ticketSubModelShow &&
            this.props.ticketSubModelShow(this.props.submodelItem, submodelData, 'submodelJumpEnd')
        }
      },
      { action: 'jump' }
    )
  }

  // 隐藏跳转弹框
  ticketJumpCancel = () => {
    this.setState({
      ticketJumpVisible: false
    })
  }

  /**
   * @Author FB
   * 跳转提交
   * 组合表单数据(form)、
   * 评论信息(message)、
   * 创建人指定的各环节处理人信息,环节id和用户id数组对应的对象(executor)、
   * 跳转环节的处理人id数组(userList)、
   * 当跳转环节是并行环节时为环节id和用户id数组对应的对象()
   */
  ticketJump = async () => {
    // 表单校验
    var data = {}
    let flag = true

    if (this.refs.jump) {
      this.refs.jump.validateFields((errors) => {
        if (errors) {
          flag = false
        }
      })
      data = this.refs.jump.getFieldsValue()
    }
    if (!flag) {
      return false
    }
    this.setState({ visible: false })
    const jumpData = _.merge(
      {},
      {
        tacheId: this.state.currentJump.id,
        ticketId: this.props.forms.ticketId,
        message: data.message,
        departId: data.departId
      },
      this.flowusers
    )
    const subExecutorsVos = []
    _.map(this.state.activitysList, (activity) => {
      if (activity.policy === 2 && activity.subModelId) {
        const subExecutorsVo = {
          activityId: activity.parentTacheId,
          modelId: activity.subModelId,
          executorsAndGroupIds: {}
        }
        subExecutorsVo.executorsAndGroupIds[activity.tacheId] =
          jumpData.executorAndGroup[activity.tacheId]
        delete jumpData.executorAndGroup[activity.tacheId]
        subExecutorsVos.push(subExecutorsVo)
      }
    })
    if (subExecutorsVos.length > 0) jumpData.subExecutorsVos = subExecutorsVos
    if (+this.state.modelRule.modelType === 1) {
      jumpData.flowId = this.state.currentJump.activityFlowId // 高级模型船线的id
    }

    this.setState({
      isSuccess: false
    })

    await this.props.handOk(jumpData, 'jump')
    this.setState({ visible: true, ticketJumpVisible: false, isSuccess: true })
  }

  showTicketCreate = () => {
    // needSuspend  0,2:挂起   1：继续   3：无关联
    this.props.validate(
      (formsData) => {
        if (
          this.props.operateType === 'createTicket' ||
          this.props.operateType === 'createTicketAlert' ||
          this.props.operateType === 'createRelateTicket'
        ) {
          let flat = false
          _.forEach(this.state.activitys, (activity, index) => {
            if ((index === 1 && activity.policy === 1) || activity.policy === 2) {
              flat = true
              return false
            }
          })
          if (!flat) {
            this.ticketCreate()
          } else {
            this.setState({
              ticketCreateVisible: true
            })
          }
        } else {
          const submodelData = {
            formsData: formsData,
            subTicketId: this.props.forms.ticketId
          }
          this.props.ticketSubModelShow &&
            this.props.ticketSubModelShow(this.props.submodelItem, submodelData, 'submodelEnd')
        }
      },
      { action: 'submit' }
    )
  }

  ticketCreateCancel = () => {
    this.setState({
      ticketCreateVisible: false
    })
  }

  ticketCreate = async () => {
    var data = {}
    let flag = true
    if (this.refs.create) {
      this.refs.create.validateFields((errors) => {
        if (errors) {
          flag = false
        }
      })
      data = this.refs.create.getFieldsValue()
    }
    if (!flag) {
      return false
    }
    this.setState({ visible: false })
    data.executor = _.omit(data, 'message', 'departId')
    data = _.pick(data, 'message', 'executor', 'departId')
    const submitData = _.assign(
      {},
      {
        message: data.message,
        departId: data.departId
      },
      this.flowusers
    )

    this.setState({
      isSuccess: false
    })
    const _this = this
    await this.props.handOk(submitData, 'submit', () => {
      _this.setState({
        ticketCreateVisible: false,
        isSuccess: true
      })
    })
    this.setState({ visible: true, ticketCreateVisible: false })
  }

  ticketSave = () => {
    this.props.handOk(null, 'save')
  }

  render() {
    const _this = this
    /* ------------------------整合合并展示的按钮开始------------------- */
    if (this.state.modelRule && this.state.menuItem.length === 0) {
      // 合并显示的按钮菜单项
      _.map(this.state.menuItemList, (item, index) => {
        const key = (Array(4).join('0') + index).slice(-4) + item.id
        if (item.ruleType === 0) {
          this.state.menuItem.push(<Menu.Item key={key}>{item.name}</Menu.Item>)
        }
      })
    }
    const menu =
      this.state.menuItem.length > 0 ? (
        <Menu onClick={this.dispatchMenu}>{this.state.menuItem}</Menu>
      ) : null
    /* -----------------------整合合并展示的按钮结束------------------- */
    const { canSubmit } = this.props.forms // 解构出提交权限字段
    const isNeedDrafts = window.localStorage.getItem('isNeedDrafts')
    return (
      <React.Fragment>
        <div className="u4-row u4-form-item operate">
          <div>
            {menu && this.state.modelRule.defaultButton && canSubmit === 1 ? ( // 有合并显示的按钮 以及默认按钮显示
              this.state.modelRule.submitName ? ( // 默认按钮是否有提示文字
                <Tooltip placement="left" title={<span>{this.state.modelRule.submitName}</span>}>
                  <Dropdown.Button
                    onClick={this.showTicketCreate}
                    className="ticket-submit btn-pc"
                    disabled={!this.state.visible}
                    overlay={menu}
                    type="primary"
                  >
                    {i18n('ticket.create.confirm_creation', '确认创建')}
                  </Dropdown.Button>
                </Tooltip>
              ) : (
                <Dropdown.Button
                  onClick={this.showTicketCreate}
                  className="ticket-submit btn-pc"
                  disabled={!this.state.visible}
                  overlay={menu}
                  type="primary"
                >
                  {i18n('ticket.create.confirm_creation', '确认创建')}
                </Dropdown.Button>
              )
            ) : this.state.modelRule && this.state.modelRule.defaultButton && canSubmit === 1 ? ( // 默认按钮显示
              this.state.modelRule.submitName ? ( // 默认按钮是否有提示文字
                <Tooltip placement="left" title={<span>{this.state.modelRule.submitName}</span>}>
                  <Button
                    type="primary"
                    disabled={!this.state.visible}
                    onClick={this.showTicketCreate}
                  >
                    {i18n('ticket.create.confirm_creation', '确认创建')}
                  </Button>
                </Tooltip>
              ) : (
                <Button
                  type="primary"
                  disabled={!this.state.visible}
                  onClick={this.showTicketCreate}
                >
                  {i18n('ticket.create.confirm_creation', '确认创建')}
                </Button>
              )
            ) : null}
            {this.state.modelRule &&
              canSubmit === 1 &&
              _.map(this.state.modelRule.ruleVos, (item, index) => {
                if (item.ruleType === 1) {
                  // 如果规则为独立显示
                  if (item.type === 1) {
                    // 如果是跳转
                    return (
                      <span key={index}>
                        <Button
                          key={index}
                          type="primary"
                          loading={!_this.state.visible}
                          onClick={() => {
                            this.ticketJumpShow(item)
                          }}
                        >
                          {item.name}
                        </Button>
                      </span>
                    )
                  } else {
                    // 如果是发起子流程
                    return (
                      <span key={index}>
                        <Button
                          key={index}
                          type="primary"
                          loading={!_this.state.visible}
                          onClick={() => {
                            this.ticketSubModelShow(item)
                          }}
                        >
                          {item.name}
                        </Button>
                      </span>
                    )
                  }
                }
              })}
            {((this.props.operateType === 'createTicket' && this.props.forms.isSaveOrDraft) ||
              isNeedDrafts) && (
              <Button onClick={this.ticketSave}>
                {i18n('ticket.from.save.draft', '保存为草稿')}
              </Button>
            )}
            {this.props.operateType === 'createRelateTicket' && (
              <Button type="primary" onClick={this.props.handleRelateCancel}>
                {i18n('cancel', '取消')}
              </Button>
            )}
          </div>
        </div>

        {/* 完成创建弹框 */}
        <Modal
          title={i18n('ticket.create.create_ticket', '创建工单')}
          className="finish-submit"
          visible={this.state.ticketCreateVisible}
          confirmLoading={!this.state.isSuccess}
          onOk={this.ticketCreate}
          onCancel={this.ticketCreateCancel}
        >
          <TicketCreate
            isCreate
            setFlowUser={this.setFlowUser}
            modelId={this.props.forms.modelId}
            showDepart={1} // 开启组织机构时 只有新建或跳转 才显示 部门下拉框
            activitys={this.state.activitys}
            ref="create"
          />
        </Modal>

        {/* 工单跳转弹框 */}
        <Modal
          title={this.state.currentJump.title}
          className="finish-submit"
          visible={this.state.ticketJumpVisible}
          confirmLoading={!this.state.isSuccess}
          onOk={this.ticketJump}
          onCancel={this.ticketJumpCancel}
        >
          {this.state.ticketJumpVisible ? (
            <TicketJump
              isCreate
              ticketType="create"
              setFlowUser={this.setFlowUser}
              visible={this.state.ticketJumpVisible}
              id={this.props.forms.ticketId}
              tache={this.state.currentJump}
              isRequiredHandingSuggestion={
                this.state.modelRule && this.state.modelRule.isRequiredHandingSuggestion
              }
              modelType={this.state.modelRule && this.state.modelRule.modelType}
              modelId={this.props.forms.modelId}
              validate={this.props.validate}
              activitys={this.state.activitysList}
              showDepart={1} // 开启组织机构时 只有新建或跳转 才显示 部门下拉框
              ref="jump"
            />
          ) : null}
        </Modal>
      </React.Fragment>
    )
  }
}
