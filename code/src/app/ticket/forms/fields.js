import React, { Component, lazy } from 'react'
import { Col } from '@uyun/components'
import classnames from 'classnames'
import uuid from '~/utils/uuid'
import { renderField } from './utils/renderField'
import ResourceStore from '~/ticket-list/stores/resourceStore'
// import RelateAutoJob from './relateAutoJob'
// import { FormMemoField } from '../../components/FormController/index'

const RelateAutoJob = lazy(() => import('./relateAutoJob'))
let autoPlanRef = React.createRef()

// 提供给低代码平台时支持的字段类型
const lowcodeFieldTypes = [
  'singleRowText',
  'flowNo',
  'multiRowText',
  'listSel',
  'business',
  'singleSel',
  'multiSel',
  'cascader',
  'layer',
  'int',
  'double',
  'dateTime',
  'richText',
  'attachfile',
  'user',
  'department',
  'userGroup',
  'treeSel',
  'securityCode',
  'topology',
  'timeInterval',
  'excelImport',
  'customizeTable',
  'tags',
  'links',
  'nodeExecution',
  'jsontext',

  'sla',
  'iframe'
]

// 用memo缓存的字段类型
// const memoFieldTypes = ['singleRowText', 'multiRowText', 'listSel', 'dateTime']
const resourceStore = new ResourceStore()
export default class FormsContent extends Component {
  constructor(props) {
    super(props)
  }
  state = {
    sandboxId: ''
  }

  onSubmitAutoPlan = () => {
    return autoPlanRef?.current?.onSubmitAutoPlan()
  }

  onValidateAutoPlan = () => {
    return autoPlanRef?.current?.onValidateAutoPlan()
  }

  _renderField = (field, dilver) => {
    if (field.type === 'placeholder') {
      return <div style={{ height: 54 }} />
    }
    if (dilver.source === 'lowcode' && !lowcodeFieldTypes.includes(field.type)) {
      return null
    }
    if (field.type === 'relateSubProcess') {
      dilver.handleOK = this.props.handleOk
    }
    if (field.type === 'relate_job') {
      return (
        <RelateAutoJob
          ref={autoPlanRef}
          field={field}
          ticketId={this.props.ticketId || this.props.id}
          formList={this.props.forms}
          getDetailForms={this.props.getDetailForms}
        />
      )
    }
    if (field.type === 'mergeTicket') {
      dilver.formList = dilver.forms
    }
    return renderField(field, dilver)

    // const Item = renderField(field, dilver)
    // if (memoFieldTypes.includes(field.type)) {
    //   return (
    //     <FormMemoField field={field} dilver={dilver}>
    //       {Item}
    //     </FormMemoField>
    //   )
    // }
    // return Item
  }

  componentWillUnmount() {
    autoPlanRef = React.createRef()
  }

  render() {
    const { fieldList, disabled, globalRegular, ...rest } = this.props
    const { ticketId, modelId, modelCode, formLayoutType } = this.props.forms
    const formDom = []
    let cols = 0
    _.forEach(fieldList, (field, index) => {
      // defaultValue为星号表示字段为仅经办人可见，当前用户不是经办人的话显示********
      // 这里只通过defaultValue来判定非经办人不够严谨
      const secrecy = field.defaultValue === '*********' && field.type !== 'securityCode'

      // 复制工单时，设置了隐私字段的组件显示*号并不可以编辑，若有正则表单则无法提交
      const dilver = {
        ...rest,
        field,
        ticketId: ticketId,
        modelId: modelId,
        modelCode: modelCode,
        disabled: disabled || secrecy,
        initialValue: field.defaultValue,
        containerId: field.id || `${field.type}${index}`,
        secrecy,
        globalRegular,
        allData: this.props.allData,
        // sandboxId: this.state.sandboxId,
        formLayoutType: formLayoutType
      }
      const { fieldLayout } = field
      const col = fieldLayout ? fieldLayout.col : field.fieldLine === 2 ? 12 : 24
      cols = cols + col
      if (cols > 24) {
        formDom.push(<Col key={index} span={24} style={{ height: '1px' }} />)
        cols = 0 + col
      }
      formDom.push(
        <Col
          span={col}
          key={field.id || `${field.type}${index}`}
          id={uuid()}
          className={classnames({
            'detail-forms-main-form-hidden': field.hidden || (field.type === 'btn' && secrecy)
          })}
        >
          {this._renderField(field, dilver)}
        </Col>
      )
    })
    return <div className="clearfix from-group-inner">{formDom}</div>
  }
}
