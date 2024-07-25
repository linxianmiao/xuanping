import React from 'react'
import { QuestionCircleOutlined } from '@uyun/icons'
import { Collapse, Tooltip, Title } from '@uyun/components'
import classnames from 'classnames'
import LazyLoad from './components/LazyLoad'
import Iframe from './iframe'
import Fields from './fields'
import Sla from './sla'
import Ola from './ola'
import RelateTicket from './relateTicket'
import RelateSubProcess from './relateSubProcess'
import ProcessRecord from './processRecord'
import MergeTicketCom from './mergeTicket'
import RemoteTicketCom from './remoteTicket'
import TicketComment from './ticketComment'
import './index.module.less'
import './newStyle.less'
const Panel = Collapse.Panel

class PanelForm extends React.Component {
  constructor(props) {
    super(props)
    this.autoPlanRef = React.createRef()
  }
  onSubmitAutoPlan = () => {
    return this.autoPlanRef?.current?.onSubmitAutoPlan()
  }
  onValidateAutoPlan = () => {
    return this.autoPlanRef?.current?.onValidateAutoPlan()
  }
  render() {
    const {
      id,
      ticketId,
      item,
      forms,
      type: propType,
      builtInProps,
      disabled,
      fold,
      startNode,
      relateTicketError,
      relateSubProcessErr,
      removeErrMesOfRelateTicket,
      getFieldsValue,
      handOk
    } = this.props
    const { fieldList, height, styleAttribute, type, hidden } = item
    const realTicketId = window.location.href.includes('createService') ? ticketId : id
    let style = { height: 'auto' }
    if (Boolean(height)) {
      style = {
        maxHeight: height,
        overflow: 'scroll'
      }
    }
    return (
      <div
        className={classnames('froms-panel-wrap', {
          'detail-forms-main-form-hidden': hidden,
          'no-border': styleAttribute === 0
        })}
        style={style}
      >
        {type === 'sla' && (
          <LazyLoad type={propType}>
            <Sla field={item} ticketId={id} fold={fold} />
          </LazyLoad>
        )}
        {type === 'iframe' && (
          <Iframe
            field={item}
            forms={forms}
            type={propType}
            disabled={disabled}
            builtInProps={builtInProps}
            fold={fold}
          />
        )}
        {type === 'relateTicket' && (
          <LazyLoad type={propType}>
            <RelateTicket
              field={item}
              startNode={startNode}
              ticketId={realTicketId}
              fold={fold}
              relateTicketError={relateTicketError}
              removeErrMesOfRelateTicket={removeErrMesOfRelateTicket}
              getCurrentTicketValue={this.props.getFormsValue || this.props.getCurrentTicketValue}
              formList={this.props.forms}
              disabled={disabled}
            />
          </LazyLoad>
        )}
        {type === 'relateSubProcess' && (
          <LazyLoad type={propType}>
            <RelateSubProcess
              field={item}
              ticketId={realTicketId}
              relateSubProcessErr={relateSubProcessErr}
              formList={this.props.forms}
              getFieldsValue={getFieldsValue}
              handleOk={handOk}
              disabled={disabled}
            />
          </LazyLoad>
        )}
        {/* {type === 'relate_job' && (
      <LazyLoad type={propType} ref={this.autoPlanRef}>
        <RelateAutoJob
          field={item}
          ticketId={ticketId || id}
          formList={this.props.forms}
          getDetailForms={this.props.getDetailForms}
        />
      </LazyLoad>
    )} */}
        {type === 'operateRecord' && (
          <LazyLoad type={propType}>
            <ProcessRecord field={item} id={realTicketId} />
          </LazyLoad>
        )}
        {type === 'mergeTicket' && (
          <LazyLoad type={propType}>
            <MergeTicketCom field={item} formList={forms} id={realTicketId} />
          </LazyLoad>
        )}
        {type === 'ola' && <Ola field={item} ticketId={id} fold={fold} />}
        {type === 'remoteTicket' && <RemoteTicketCom field={item} id={id} fold={fold} />}
        {type === 'ticketComment' && <TicketComment field={item} id={id} fold={fold} />}
        {type !== 'iframe' &&
          type !== 'sla' &&
          type !== 'relateTicket' &&
          type !== 'relateSubProcess' &&
          type !== 'relate_job' &&
          type !== 'operateRecord' &&
          type !== 'mergeTicket' &&
          type !== 'remoteTicket' &&
          type !== 'ola' &&
          type !== 'ticketComment' && (
            <LazyLoad type={propType} ref={this.autoPlanRef}>
              <Fields
                {...this.props}
                fieldList={fieldList}
                handleOk={handOk}
                ref={this.autoPlanRef}
              />
            </LazyLoad>
          )}
      </div>
    )
  }
}
export default PanelForm
