import React, { Component } from 'react'
import { observer, Provider, inject } from 'mobx-react'
import { Prompt } from 'react-router-dom'
import { Spin, Button, message, Card, Row, Col } from '@uyun/components'
import stores from './stores'
import BasicForm from './basicForm'
import ConditionForm from './conditionForm'
import conditonList from './config/conditonList'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import ErrorBoundary from '~/components/ErrorBoundary'
import ActionList from './actionList'
import './styles/index.less'
import _ from 'lodash'

@inject('globalStore')
@observer
class PolicyIndex extends Component {
  static defaultProps = {
    store: stores.policyStore
  }

  constructor(props) {
    super(props)
    this.basicForm = React.createRef()
    this.begin = React.createRef()
    this.end = React.createRef()
    this.state = {
      modelId: '', // 条件 流程阶段需要用到
      btnLoading: false,
      leaveNotify: false
    }
  }

  async componentDidMount() {
    if (this.props.match.params.id) {
      const res = (await this.props.store.getPolicy(this.props.match.params.id)) || {}
      this.setState({ modelId: res.model })
    }
  }

  componentWillUnmount() {
    this.props.store.distory()
  }

  handleChangeModelId = (modelId) => {
    this.setState({ modelId })
    // 修改工单模型类型后，重置 开始/结束 条件
    this.begin.current.reset()
    this.end.current.reset()
  }

  validate = () => {
    return new Promise((resolve, reject) => {
      const actions = this.props.store.actions

      const falt = _.every(actions, (action) => {
        const { strategyType, timeDifference, types } = action

        if (strategyType !== 0 && _.isNaN(Number(timeDifference))) {
          return false
        }
        if (_.isEmpty(types)) {
          return false
        }
        if (_.includes(types, '2')) {
          return _.every(action.actions, (item) => {
            const { useable, type, title, content, acceptor, configTicket, url, requestType } = item
            if (useable === 1) {
              if (type === 'sendEmail' && !title) {
                return false
              }
              if (type === 'configTicket') {
                return _.every(configTicket, (ticket) =>
                  Boolean(ticket.paramValue && ticket.paramName)
                )
              }
              if (type === 'restful' && (!url || !requestType)) {
                return false
              }
              if (type !== 'configTicket' && type !== 'restful' && (!content || !acceptor[0])) {
                return false
              }
              return true
            }
            return true
          })
        }

        return true
      })

      if (!falt) {
        message.error('请完善策略定义')
        reject(new Error('请完善策略定义'))
      } else {
        resolve(actions)
      }
    })
  }

  handleSave = async () => {
    const { id } = this.props.match.params
    const basic = await this.basicForm.current.validateForms()
    const begin = await this.begin.current.validateForms()
    const end = await this.end.current.validateForms()
    const actions = await this.validate()

    this.setState({ btnLoading: true })
    let res
    if (id) {
      const data = _.assign({}, basic, begin, end, { id, actions })
      res = await this.props.store.updatePolicy(data)
    } else {
      const data = _.assign({}, basic, begin, { actions }, end)
      res = await this.props.store.createPolicy(data)
    }
    this.setState({ btnLoading: false })
    if (res === '200') {
      message.success(i18n('save_success'))
      this.onValuesChange(false)
      this.props.history.push('/conf/sla/policy')
    }
  }

  onValuesChange = (leaveNotify) => {
    if (leaveNotify !== this.state.leaveNotify) {
      this.setState({ leaveNotify })
    }
  }

  resetIncedientRadio = () => {
    this.begin.current.props.form.setFieldsValue({
      beginEventType: 0
    })
    this.end.current.props.form.setFieldsValue({
      endEventType: 0
    })
  }

  render() {
    const { loading, policy } = this.props.store
    const { slaInsert, slaModify } = this.props.globalStore.configAuthor
    const { modelId, btnLoading } = this.state
    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 8 }
    }
    const formItemLayout1 = {
      wrapperCol: { span: 20, offset: 2 }
    }
    const startConditonList = _.filter(
      conditonList,
      (item) => !_.includes(['complete', 'closed', 'delete'], item.code)
    )
    const endConditonList = _.filter(conditonList, (item) => !_.includes(['created'], item.code))
    const {
      sla,
      name,
      model,
      modelName,
      beginIncident,
      endIncident,
      endCondition,
      beginCondition,
      beginEventType,
      endEventType
    } = policy
    let isSave = false
    if (this.props.match.params.id) {
      isSave = slaInsert
    } else {
      isSave = slaModify
    }
    return (
      <Provider {...stores}>
        <Spin delay={300} spinning={loading}>
          <div className="sla-policy-edit-wrap notification-wrap" id="policy">
            <PageHeader />
            <ContentLayout>
              <Prompt when={this.state.leaveNotify} message="" />
              <Card title={i18n('conf.model.basicInfo', '基本信息')}>
                <ErrorBoundary desc={i18n('basicInfo.Failed', '基本信息加载失败')}>
                  <BasicForm
                    wrappedComponentRef={this.basicForm}
                    name={name}
                    sla={sla}
                    model={model}
                    modelName={modelName}
                    slaInsert={slaInsert}
                    resetIncedientRadio={this.resetIncedientRadio}
                    formItemLayout={formItemLayout}
                    onValuesChange={this.onValuesChange}
                    handleChangeModelId={this.handleChangeModelId}
                  />
                </ErrorBoundary>
              </Card>
              <Card title={i18n('condition.definition')}>
                <ErrorBoundary desc={i18n('condition.definition.Failed', '条件定义加载失败')}>
                  <ConditionForm
                    wrappedComponentRef={this.begin}
                    title={i18n('sla-policy_start_condition', '开始条件')}
                    desc={i18n('sla-policy-start-hit', '当条件匹配则触发开始SLA计算')}
                    code="begin"
                    incident={beginIncident}
                    eventType={beginEventType}
                    modelId={modelId}
                    condition={beginCondition}
                    formItemLayout={formItemLayout}
                    formItemLayout1={formItemLayout1}
                    list={startConditonList}
                    onValuesChange={this.onValuesChange}
                  />
                  <ConditionForm
                    wrappedComponentRef={this.end}
                    title={i18n('sla-policy_end_condition', '结束条件')}
                    desc={i18n('sla-policy-end-hit', '当条件匹配则触发结束SLA计算')}
                    code="end"
                    modelId={modelId}
                    incident={endIncident}
                    eventType={endEventType}
                    condition={endCondition}
                    formItemLayout={formItemLayout}
                    formItemLayout1={formItemLayout1}
                    list={endConditonList}
                    onValuesChange={this.onValuesChange}
                  />
                </ErrorBoundary>
              </Card>
              <Card title={i18n('policy.definition')}>
                <ErrorBoundary desc={i18n('policy.definition.Failed', '策略定义加载失败')}>
                  <ActionList
                    triggerNode="policy"
                    formItemLayout={formItemLayout}
                    onValuesChange={this.onValuesChange}
                  />
                </ErrorBoundary>
              </Card>
              {isSave && (
                <Row style={{ paddingTop: 20 }}>
                  <Col offset={2}>
                    <Button
                      loading={btnLoading}
                      type="primary"
                      style={{ width: 156 }}
                      onClick={this.handleSave}
                    >
                      {i18n('globe.save', '保存')}
                    </Button>
                  </Col>
                </Row>
              )}
            </ContentLayout>
          </div>
        </Spin>
      </Provider>
    )
  }
}

export default PolicyIndex
