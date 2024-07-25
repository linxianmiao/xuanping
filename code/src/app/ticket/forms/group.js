import React, { Component, lazy } from 'react'
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
import './newStyle.less'
import _ from 'lodash'
import { formGroupStore } from './formGroupStore'

const Panel = Collapse.Panel
class FormsGroup extends Component {
  constructor(props) {
    super(props)
    this.autoPlanRef = React.createRef()
    const { fold } = this.props
    this.state = {
      open: fold === 0
    }
  }
  componentDidMount() {
    // 表单校验错误展开
    this.unsubscribe = formGroupStore.subscribe(() => {
      const { code } = formGroupStore.getState()
      const { fieldList } = this.props.item
      const { open } = this.state
      if (!open && _.find(fieldList, (item) => item.code === code)) {
        this.setState({ open: true })
      }
    })
  }
  componentWillUnmount() {
    this.unsubscribe()
  }
  onSubmitAutoPlan = () => {
    return this.autoPlanRef?.current?.onSubmitAutoPlan()
  }
  onValidateAutoPlan = () => {
    return this.autoPlanRef?.current?.onValidateAutoPlan()
  }
  toggleOpen = () => this.setState((prev) => ({ open: !prev.open }))
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
    const { open } = this.state
    const { fieldList, name, description, type, hidden } = item
    let allFieldsHidden = Array.isArray(fieldList) && fieldList.every((d) => d.hidden)
    const realTicketId = window.location.href.includes('createService') ? ticketId : id
    return (
      <div
        className={classnames('froms-group-wrap', {
          'detail-forms-main-form-hidden': hidden
        })}
      >
        {type === 'sla' && (
          <LazyLoad type={propType}>
            <Sla field={item} ticketId={id} fold={fold} source={this.props.source} />
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
              open={open}
              toggleOpen={this.toggleOpen}
              relateTicketError={relateTicketError}
              removeErrMesOfRelateTicket={removeErrMesOfRelateTicket}
              getCurrentTicketValue={this.props.getFormsValue || this.props.getCurrentTicketValue}
              formList={this.props.forms}
              disabled={disabled}
              source={this.props.source}
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
              source={this.props.source}
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
            <ProcessRecord field={item} id={realTicketId} source={this.props.source} />
          </LazyLoad>
        )}
        {type === 'mergeTicket' && (
          <LazyLoad type={propType}>
            <MergeTicketCom
              field={item}
              formList={forms}
              id={realTicketId}
              source={this.props.source}
            />
          </LazyLoad>
        )}
        {type === 'ola' && <Ola field={item} ticketId={id} fold={fold} />}
        {type === 'remoteTicket' && (
          <RemoteTicketCom field={item} id={id} fold={fold} source={this.props.source} />
        )}
        {type === 'ticketComment' && (
          <TicketComment field={item} id={id} fold={fold} source={this.props.source} />
        )}
        {type !== 'iframe' &&
          type !== 'sla' &&
          type !== 'relateTicket' &&
          type !== 'relateSubProcess' &&
          type !== 'relate_job' &&
          type !== 'operateRecord' &&
          type !== 'mergeTicket' &&
          type !== 'remoteTicket' &&
          type !== 'ola' &&
          type !== 'ticketComment' &&
          !allFieldsHidden && (
            <LazyLoad type={propType} ref={this.autoPlanRef}>
              <Collapse
                onChange={this.toggleOpen}
                activeKey={open ? ['1'] : []}
                className="no-border-collapse"
              >
                <Panel
                  key="1"
                  forceRender
                  header={<Title>{name}</Title>}
                  extra={
                    description && (
                      <Tooltip
                        placement="leftBottom"
                        title={<div className="pre-wrap">{description}</div>}
                      >
                        <QuestionCircleOutlined />
                      </Tooltip>
                    )
                  }
                >
                  <Fields
                    {...this.props}
                    fieldList={fieldList}
                    handleOk={handOk}
                    ref={this.autoPlanRef}
                  />
                </Panel>
              </Collapse>
            </LazyLoad>
          )}
      </div>
    )
  }
}
export default FormsGroup
