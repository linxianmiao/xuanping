import React from 'react'
import { Modal, Tooltip, Checkbox, Button } from '@uyun/components'
import * as R from 'ramda'

// 创建工单时需要传formId，工单详情界面需要传数组中的参数
const getKeysByParams = (params) => {
  const keys = ['ticketId', 'modelId', 'caseId', 'tacheId']
  const notUndefinedKeys = keys.filter((key) => typeof params[key] !== 'undefined')
  if (params.formId && notUndefinedKeys.length !== keys.length && params?.type !== 'detail') {
    return ['formId']
  }
  return notUndefinedKeys
}

export default class TicketGuide extends React.Component {
  static defaultProps = {
    params: {}
  }

  state = {
    visible: false,
    operateGuide: '',
    noMoreGuide: false
  }

  queryFormInfo = async () => {
    const paramKeys = getKeysByParams(this.props.params)
    if (paramKeys.length === 0) return
    const params = R.pick(paramKeys, this.props.params)
    const noMoreGuide = JSON.parse(
      localStorage.getItem(
        `noMoreGuide-${this.props.params.modelId}-${this.props.params?.formId || undefined}`
      )
    )
    if (noMoreGuide) return
    try {
      const res = await axios.get(API.queryGuideInfo, { params })
      const { isOperateGuide, operateGuide } = res

      this.setState((state) => ({
        operateGuide,
        // 没内容就不展示
        visible: operateGuide && (isOperateGuide || state.visible)
      }))
    } catch (error) {
      console.log(error)
    }
  }

  // componentDidMount() {
  //   this.queryFormInfo()
  // }

  componentDidUpdate(prevProps) {
    if (this.props.operateGuide !== prevProps.operateGuide && !!this.props.operateGuide) {
      this.queryFormInfo()
      return
    }
    // 若传进来的params有任何一个改变，就重新请求一遍接口
    let paramKeys = getKeysByParams(this.props.params)
    paramKeys = [...paramKeys, 'formId']
    const isDiff = paramKeys.some((key) => this.props.params[key] !== prevProps.params[key])
    if (!isDiff) return
    if (this.props.operateGuide) {
      this.queryFormInfo()
    }
  }

  handleCancel = () => {
    this.setState({ visible: false })
  }

  openModal = () => {
    this.setState({ visible: true })
  }

  change = (e) => {
    this.setState({ noMoreGuide: e.target.checked })
  }

  submitGuide = () => {
    const paramKeys = getKeysByParams(this.props.params)
    if (paramKeys.length === 0) return
    const { noMoreGuide } = this.state
    if (noMoreGuide) {
      localStorage.setItem(
        `noMoreGuide-${this.props.params.modelId}-${this.props.params.formId}`,
        JSON.stringify(noMoreGuide)
      )
    }
    this.setState({ visible: false })
  }

  render() {
    const { visible, operateGuide } = this.state
    const { className } = this.props
    return (
      <React.Fragment>
        {operateGuide && (
          <span className={className} onClick={this.openModal}>
            {i18n('flow-guide', '流程指引')}
            {/* <Tooltip title={i18n('flow-guide', '流程指引')} placement="bottom">
              <i className="iconfont icon-liuchengzhiyin" />
            </Tooltip> */}
          </span>
        )}
        <Modal
          title={i18n('guide-explanation', '引导说明')}
          wrapClassName="ticket-guide-wrap"
          visible={!!visible}
          footer={null}
          destroyOnClose
          onCancel={this.handleCancel}
          size="large"
        >
          <div dangerouslySetInnerHTML={{ __html: operateGuide }} />
          <div className="guide-ticket-btn">
            <Checkbox onChange={this.change}>
              {i18n('tip-nomore-tips', '下次打开该类表单，不再弹出引导说明。')}
            </Checkbox>
          </div>
          <div className="guide-ticket-btn-close" onClick={this.submitGuide}>
            <Button type="primary">{i18n('globe.close', '关闭')}</Button>
          </div>
        </Modal>
      </React.Fragment>
    )
  }
}
