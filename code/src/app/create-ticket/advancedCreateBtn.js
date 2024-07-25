import React, { Component } from 'react'
import { Button, Dropdown, Modal } from '@uyun/components'
import { DownOutlined } from '@uyun/icons'
import TicketTemp from '~/components/TicketTemp'
import SeniorCreateJump from '../ticket/btn/operate/seniorCreateJump'
import iframeResource from '~/ticket/btn/iframeResource'

@iframeResource
class CreateBtn extends Component {
  // 高级模型的创建工单页面
  constructor(props) {
    super(props)
    this.flowusers = null
    this.state = {
      modelRule: null, // 创建页按钮列表
      ticketJumpVisible: false, // 跳转模态框
      currentJump: {}, // 发起跳转时对应跳转环节信息
      visible: true,
      isSuccess: true,
      formData: {},
      formValue: null // 表单数据
    }
  }

  componentDidMount() {
    this.setState({
      visible: this.state.visible ? this.state.visible : this.props.visible
    })

    // 获取第一环节信息
    this.props.id && this.getFirstActivity(this.props.id)
  }

  componentWillReceiveProps(nextProps) {
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
        ticketJumpVisible: false, // 跳转模态框
        currentJump: {} // 发起创建并跳转时选中的跳转项 跳转规则
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
    // 第一时间无法拿到表单数据，所以设置一个setTimeout
    setTimeout(() => {
      // 获取所有环节，用于创建提交时 判断由创建人指定的执行人环节
      axios.get(API.getTargetNode(id)).then((data) => {
        this.setState({
          modelRule: data
        })
      })
    })
  }
  /* ------------点击合并显示的按钮所做操作，根据按钮key区分--------------- */

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
    this.flowusers = _.cloneDeep(flowusers)
  }

  // 独立显示的跳转按钮 点击事件
  ticketJumpShow = async (item) => {
    const postMes = {
      flowCode: item.flowCode,
      action: 'jump'
    }
    try {
      this.setState({ visible: false })
      // 此处校验
      await this.props.validate((formsData) => {
        // 弹出时调用表单数据
        const commentData = formsData
        axios.post(API.getRealNodes(this.props.id, item.flowId), commentData).then((data) => {
          this.setState({ visible: true })
          if (_.isEmpty(data)) {
            if (
              this.props.operateType === 'createTicket' ||
              this.props.operateType === 'createTicketAlert' ||
              this.props.operateType === 'createRelateTicket' ||
              this.props.createType === 'createSubTask'
            ) {
              this.setState(
                {
                  currentJump: item,
                  formValue: formsData
                },
                () => {
                  this.ticketJump()
                }
              )
            } else {
              const submodelData = {
                formsData: formsData,
                subTicketId: this.props.forms.ticketId,
                jumpActivity: {
                  activityFlowId: item.flowId
                }
              }
              this.props.ticketSubModelShow &&
                this.props.ticketSubModelShow(
                  this.props.submodelItem,
                  submodelData,
                  'submodelJumpEnd',
                  data
                )
            }
          } else {
            // 高级流程的时候进行变量初始化
            if (
              this.props.operateType === 'createTicket' ||
              this.props.operateType === 'createTicketAlert' ||
              this.props.operateType === 'createRelateTicket' ||
              this.props.createType === 'createSubTask'
            ) {
              this.setState({
                newList: data,
                ticketJumpVisible: true,
                currentJump: item,
                formValue: formsData
              })
            } else {
              const jumpActivity = _.find(data, (ite) => {
                return ite.flowId === item.flowId
              }) || { flowId: item.flowId, policy: data[0]?.policy }
              const jumpActivityData = {
                id: jumpActivity.tacheId,
                tacheId: jumpActivity.tacheId,
                title: jumpActivity.flowName,
                name: jumpActivity.tacheName,
                policy: jumpActivity.policy,
                activityFlowId: jumpActivity.flowId,
                tacheType: 0
              }
              const submodelData = {
                formsData: formsData,
                subTicketId: this.props.forms.ticketId,
                jumpActivity: jumpActivityData
              }
              this.props.ticketSubModelShow &&
                this.props.ticketSubModelShow(
                  this.props.submodelItem,
                  submodelData,
                  'submodelJumpEnd',
                  data
                )
            }
          }
        })
      }, postMes)
    } catch (e) {
      this.setState({ visible: true })
    }
  }

  // 隐藏跳转弹框
  ticketJumpCancel = () => {
    this.setState({
      ticketJumpVisible: false,
      visible: true
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
        ticketId: this.props.forms.ticketId,
        flowId: this.state.currentJump.flowId,
        flowCode: this.state.currentJump.flowCode,
        message: data.message,
        departId: data.departId
      },
      this.flowusers
    )
    const subExecutorsVos = []

    _.map(this.state.newList, (activity) => {
      if (activity.subProcess) {
        const subExecutorsVo = {
          activityId: activity.parentTacheId,
          modelId: activity.modelId,
          executorsAndGroupIds: {}
        }
        subExecutorsVo.executorsAndGroupIds[activity.tacheId] =
          jumpData.executorAndGroup[activity.tacheId]
        delete jumpData.executorAndGroup[activity.tacheId]
        subExecutorsVos.push(subExecutorsVo)
      }
    })
    if (subExecutorsVos.length > 0) jumpData.subExecutorsVos = subExecutorsVos
    this.setState({
      isSuccess: false
    })

    await this.props.handOk(jumpData, 'jump')
    this.setState({ visible: true, ticketJumpVisible: false, isSuccess: true })
  }

  ticketSave = () => {
    this.props.validate(
      () => {
        this.props.handOk(null, 'save')
      },
      { action: 'save' }
    )
  }

  render() {
    const isNeedDrafts = window.localStorage.getItem('isNeedDrafts')
    const { modelRule, currentJump, visible, ticketJumpVisible, newList, isSuccess, formValue } =
      this.state
    const {
      operateType,
      forms,
      handleRelateCancel,
      validate,
      locationSource,
      sourceType,
      source,
      createService = false
    } = this.props
    const showDraftBtn =
      (((operateType === 'createTicket' || this.props.createType === 'createSubTask') &&
        forms.isSaveOrDraft) ||
        isNeedDrafts ||
        sourceType === 'subOrService') &&
      source !== 'lowcode'
    const showSaveTemplateBtn =
      locationSource !== 'sloth' &&
      (createService || operateType !== 'createTicketAlert') &&
      this.props.createType !== 'createSubTask' &&
      source !== 'lowcode'
    let items = []
    if (showDraftBtn) {
      items.push({
        key: '1',
        label: <a onClick={this.ticketSave}>{i18n('ticket.from.save.draft', '保存为草稿')}</a>
      })
    }
    if (showSaveTemplateBtn) {
      items.push({
        key: '2',
        label: (
          <TicketTemp
            type="button"
            hideButton
            fieldList={_.get(forms, 'fields')}
            modelId={_.get(forms, 'modelId')}
            getTicketValues={this.props.getFormsValue}
          />
        )
      })
    }
    return (
      <React.Fragment>
        <div className="u4-form-item operate" style={{ textAlign: 'center' }}>
          <div>
            {modelRule &&
              forms.canSubmit === 1 &&
              _.map(modelRule, (item, index) => {
                return (
                  <span key={index}>
                    <Button
                      key={index}
                      type="primary"
                      loading={!visible}
                      onClick={() => {
                        this.ticketJumpShow(item)
                      }}
                    >
                      {item.flowName}
                    </Button>
                  </span>
                )
              })}
            {
              /**当存为草稿和保存为模板都存在时 */
              (showDraftBtn || showSaveTemplateBtn) && (
                <Dropdown menu={{ items }}>
                  <Button>
                    保存为
                    <DownOutlined />
                  </Button>
                </Dropdown>
              )
            }
            {operateType === 'createRelateTicket' && (
              <Button type="primary" onClick={handleRelateCancel}>
                {i18n('cancel', '取消')}
              </Button>
            )}
          </div>
        </div>
        <Modal
          title={currentJump.flowName}
          className="finish-submit"
          visible={ticketJumpVisible}
          confirmLoading={!isSuccess}
          onOk={this.ticketJump}
          onCancel={this.ticketJumpCancel}
          destroyOnClose
        >
          {ticketJumpVisible ? (
            <SeniorCreateJump
              isCreate
              ticketType="create"
              setFlowUser={this.setFlowUser}
              visible={ticketJumpVisible}
              id={forms.ticketId}
              flowId={currentJump.flowId}
              modelType={1}
              modelId={forms.modelId}
              validate={validate}
              activitys={newList}
              formValue={formValue}
              showDepart={1} // 开启组织机构时 只有新建或跳转 才显示 部门下拉框
              ref="jump"
            />
          ) : null}
        </Modal>
      </React.Fragment>
    )
  }
}
export default CreateBtn
