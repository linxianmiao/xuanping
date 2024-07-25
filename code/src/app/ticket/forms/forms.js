import React, { Component } from 'react'
import { Form } from '@uyun/components'

import FormsGroup from './group'
import FormsTab from './tab'
import LazyLoad from './components/LazyLoad'
import RelateAutoJob from './relateAutoJob'
import PanelForm from './panel'
import ResourceStore from '~/ticket-list/stores/resourceStore'
import { getInitialValueOfField } from './utils/logic'

const resourceStore = new ResourceStore()

class Forms extends Component {
  constructor(props) {
    super(props)
    this.autoPlanRef = React.createRef()
    this.state = {
      sandboxId: ''
    }
  }
  onSubmitAutoPlan = () => {
    return this.autoPlanRef?.current?.onSubmitAutoPlan()
  }
  onValidateAutoPlan = () => {
    return this.autoPlanRef?.current?.onValidateAutoPlan()
  }
  batchGetFieldDecorator = () => {
    const { formLayoutVos } = this.props
    const { getFieldDecorator } = this.props.form

    _.forEach(formLayoutVos, (item) => {
      if (item.type === 'group') {
        _.forEach(item.fieldList, (field) => {
          if (field.code && field.type !== 'placeholder' && field.type !== 'iframe') {
            getFieldDecorator(field.code, { initialValue: getInitialValueOfField(field) })
          }
        })
      } else {
        _.forEach(item.tabs, (tab) => {
          _.forEach(tab.fieldList, (field) => {
            if (field.code && field.type !== 'placeholder' && field.type !== 'iframe') {
              getFieldDecorator(field.code, { initialValue: getInitialValueOfField(field) })
            }
          })
        })
      }
    })
  }

  componentDidMount() {
    this.querySandboxId()
  }

  componentDidUpdate(prevProps) {
    const { forms } = this.props
    if (prevProps?.forms.ticketId !== forms?.ticketId) {
      this.querySandboxId()
    }
  }

  // 查沙箱id
  querySandboxId = async () => {
    const { forms } = this.props
    const { ticketId } = forms
    if (!ticketId) {
      return
    }

    let fields = []
    _.forEach(forms?.formLayoutVos, (d) => {
      if (d.type === 'group') {
        fields = [...d.fieldList, ...fields]
      } else {
        _.forEach(d.tabs, (tab) => {
          fields = [...fields, ...tab.fieldList]
        })
      }
    })
    const types = _.map(fields, (item) => item.type)
    if (!types.includes('resource')) return

    const res = await axios.get(API.getSandboxId, { params: { ticketId } })
    const sandboxId = !res || res === '200' ? '' : res
    resourceStore.setSandboxID(sandboxId)
    this.setState({ sandboxId })
  }

  render() {
    const {
      getFieldDecorator,
      setFieldsValue,
      getFieldValue,
      getFieldsError,
      getFieldError,
      getFieldsValue
    } = this.props.form
    const { sandboxId } = this.state
    const { formLayoutVos, popupContainerId, getAgainDetailForms, ...rest } = this.props
    const editable =
      window.location.href.includes('createTicket') ||
      window.location.href.includes('createService') ||
      !this.props.disabled

    // 因为formItem做懒加载了，为了防止表单取值和脚本、联动等失效
    // 先统一注册表单字段初始值
    this.batchGetFieldDecorator()
    return (
      <div
        id="ticket-forms-wrap"
        style={{ position: 'relative' }}
        className={editable ? 'ticket-wrap-edit' : 'ticket-wrap-disabled'}
      >
        <Form layout="horizontal">
          {_.map(formLayoutVos, (item, index) => {
            const dilver = {
              ...rest,
              item,
              getFieldDecorator,
              setFieldsValue,
              getFieldValue,
              getFieldsError,
              getFieldError,
              formLayoutVos,
              popupContainerId: popupContainerId || 'itsm-wrap',
              getAgainDetailForms,
              allData: this.props.allData,
              btnClick: this.props.btnClick,
              getFieldsValue,
              sandboxId: sandboxId
            }
            if (
              item.type === 'group' ||
              item.type === 'iframe' ||
              item.type === 'sla' ||
              item.type === 'relateTicket' ||
              item.type === 'relateSubProcess' ||
              item.type === 'operateRecord' ||
              item.type === 'mergeTicket' ||
              item.type === 'ola' ||
              item.type === 'remoteTicket' ||
              item.type === 'ticketComment'
            ) {
              return <FormsGroup key={index} {...dilver} fold={item.fold} ref={this.autoPlanRef} />
            } else if (item.type === 'panel') {
              return <PanelForm key={index} {...dilver} />
            } else if (item.type === 'relate_job') {
              return (
                <LazyLoad type={this.props.type} ref={this.autoPlanRef}>
                  <RelateAutoJob
                    field={item}
                    ticketId={dilver.ticketId || dilver.id}
                    formList={dilver.forms}
                    getDetailForms={dilver.getDetailForms}
                  />
                </LazyLoad>
              )
            } else if (item.type === 'tab') {
              return (
                <LazyLoad type={this.props.type} ref={this.autoPlanRef}>
                  <FormsTab
                    key={index}
                    ref={(node) => {
                      this[index] = node
                    }}
                    {...dilver}
                  />
                </LazyLoad>
              )
            }
          })}
        </Form>
      </div>
    )
  }
}

export default Form.create({
  onValuesChange: (props, changedValues, allValues) => {
    window.TICKET_CHANGECODELIST = new Set(_.keys(changedValues))
    props.handleFieldChange(changedValues, allValues)
  }
})(Forms)
