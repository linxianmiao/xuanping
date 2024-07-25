import React, { Component, lazy, Suspense } from 'react'
import { Collapse, Button, Tooltip } from '@uyun/components'
import Detail from '../relatedJob/job/Detail'
import { planExecuteStep, getPlanDetailData } from '~/ticket/forms/utils/logic'
import './index.less'

const AutoPlanEdit = lazy(() =>
  import(/* webpackChunkName: "automation-plan-edit" */ '~/components/automation-plan-edit')
)
const AutoPlanDetail = lazy(() =>
  import(/* webpackChunkName: "automation-plan-detail" */ '~/components/automation-plan-detail')
)

function getExecutePlanData(fieldList) {
  const executePlanData = Array.isArray(fieldList)
    ? fieldList.find((item) => item.code === 'execute_plan_data')
    : ''
  return executePlanData ? executePlanData?.defaultValue || {} : {}
}
function getStep(fieldList) {
  const jobExecuteStep = Array.isArray(fieldList)
    ? fieldList.find((item) => item.code === 'job_execute_step')
    : ''
  return jobExecuteStep ? jobExecuteStep?.defaultValue : ''
}
function isExec(planDetail = {}) {
  const { model = {} } = planDetail
  const { execTime, deadline } = model
  const now = Date.now()
  return deadline >= now && now >= execTime ? true : false
}

export default class RelateAutoJob extends Component {
  constructor(props) {
    super(props)
    this.autoPlanRef = React.createRef()
  }

  state = {
    id: '',
    iframeType: '',
    jobId: '',
    activeKey: []
  }

  componentDidMount() {
    this.setState({
      id: getExecutePlanData(this.props.field.fieldList || []).id
    })
  }

  onSubmitAutoPlan = () => {
    return this.autoPlanRef?.current?.onSubmit()
  }

  onValidateAutoPlan = () => {
    const validate = this.autoPlanRef?.current?.onValidate()
    if (this.state.activeKey.length === 0) {
      this.setState({ activeKey: ['1'] })
    }
    return validate
  }

  render() {
    const { activeKey } = this.state
    const { field, ticketId, formList = {}, foldSource } = this.props
    const { name, height = 500, styleAttribute, fold, isRequired } = field || {}
    const step = planExecuteStep(formList?.formLayoutVos)
    return (
      <div id={foldSource === 'setting' ? '' : 'relate_job'}>
        <Collapse
          activeKey={fold === 0 ? ['1'] : activeKey}
          onChange={(key) => this.setState({ activeKey: key })}
        >
          <Collapse.Card
            header={<span>{name}</span>}
            key="1"
            extra={this.renderExtra(step)}
            forceRender
          >
            <Suspense fallback={null}>
              {step === 2 ||
              step === 3 ||
              (step === 1 &&
                formList?.isExcutor !== 1 &&
                !window.location.href.includes('drafts')) ? (
                <AutoPlanDetail
                  id={this.state.id}
                  status={step}
                  hideVertical={true}
                  hideField={[
                    'noWaitWhenExecError',
                    'isSendAlert',
                    'sensitiveUsers',
                    'execAuthUsers',
                    'optScene'
                  ]}
                />
              ) : (
                <AutoPlanEdit
                  ref={this.autoPlanRef}
                  id={this.state.id}
                  ticketId={ticketId}
                  modelId={formList?.modelId}
                  modelCode={formList?.modelCode}
                  hideField={[
                    'name',
                    'execAuth',
                    'execAccount',
                    'isSendAlert',
                    'noWaitWhenExecError',
                    'timeout',
                    'verifyCode',
                    'optScene',
                    'accreditUsers'
                  ]}
                  product="itsm"
                />
              )}
            </Suspense>

            <Detail
              iframeType={this.state.iframeType}
              id={this.state.jobId}
              onClose={() => this.setState({ iframeType: '', jobId: '' })}
            />
          </Collapse.Card>
        </Collapse>
      </div>
    )
  }

  renderExtra(step) {
    const { getDetailForms = () => {}, field, ticketId, formList } = this.props
    const planDetail = getExecutePlanData(field?.fieldList || [])
    const planDetailData = getPlanDetailData(formList?.formLayoutVos)
    // console.log('planDetailData', planDetailData)
    const canExec = isExec(planDetailData)
    const execPlan = (e, ticketId) => {
      e.stopPropagation()
      const planId = planDetailData.id
      axios.post('/itsm/api/v2/job/plan/execute', { planId, ticketId }).then((res) => {
        if (res) {
          getDetailForms()
        }
      })
    }
    switch (step) {
      case 2:
        return planDetailData?.model?.strategy === 1 && formList?.isExcutor === 1 ? (
          <Tooltip title={!canExec ? '未到执行时间' : ''} onClick={(e) => e.stopPropagation()}>
            <Button size="small" onClick={(e) => execPlan(e, ticketId)} disabled={!canExec}>
              执行
            </Button>
          </Tooltip>
        ) : null
      case 3:
        return (
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              this.setState({
                iframeType: 'plan-job',
                jobId: getExecutePlanData(field?.fieldList || []).jobId
              })
            }}
          >
            查看作业
          </Button>
        )
      default:
        return null
    }
  }
}
