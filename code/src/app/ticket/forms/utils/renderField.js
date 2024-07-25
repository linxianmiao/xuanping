import React, { lazy } from 'react'
import SingleRowText from '../singleRowText'
import MultiRowText from '../multiRowText'
import SingleSel from '../singleSel'
import ListSel from '../listSel'
import MultiSel from '../multiSel'
import Cascader from '../cascader'
import Layer from '../layer'
import Int from '../int'
import Double from '../double'
import RichText from '../richText'
import Topology from '../topology'
import TableData from '../table'
import Attachfile from '../attachfile'
import Resource from '../resource'
import User from '../user'
import Department from '../department'
import UserGroup from '../userGroup'
import TreeSel from '../treeSel'
import TimeInterval from '../timeInterval'
import Iframe from '../iframe'
import ExcelImport from '../excelImport'
import SecurityCode from '../securityCode'
import DateTime from '../dateTime'
import CustomizeTable from '../customizeTable'
import RelatedJob from '../relatedJob'
import Tags from '../tags'
import LinksField from '../links'
import NodeExecution from '../nodeExecution'
import CustomizeField from '../customizeField'
import Permission from '../permission'
import Sla from '../sla'
import Ola from '../ola'
import JSONTEXT from '../jsontext'
import RelateTicket from '../relateTicket'
import RelateSubProcess from '../relateSubProcess'
import MergeTicket from '../mergeTicket'
import Btn from '../btn'
import ProcessRecord from '../processRecord'
import Creator from '../creator'
import ExcutorAndGroup from '../excutorAndGroup'
import CurrentTacheForm from '../currentTache'
import RemoteTicket from '../remoteTicket'
import TicketComment from '../ticketComment'
import SlaStatus from '../slaStatus'
import OlaStatus from '../olaStatus'
import CurrentStage from '../currentStage'
import NestedTable from '../nestedTable'

const RelateAutoJob = lazy(() => import('../relateAutoJob'))

export function renderField(field, dilver) {
  switch (field.type) {
    case 'singleRowText':
      return <SingleRowText key={field.code} {...dilver} />
    case 'multiRowText':
      return <MultiRowText key={field.code} {...dilver} />
    case 'listSel':
    case 'business':
      return <ListSel key={field.code} {...dilver} />
    case 'singleSel':
      return <SingleSel key={field.code} {...dilver} />
    case 'multiSel':
      return <MultiSel key={field.code} {...dilver} />
    case 'cascader':
      return <Cascader key={field.code} {...dilver} />
    case 'layer':
      return <Layer key={field.code} {...dilver} />
    case 'int':
      return <Int key={field.code} {...dilver} />
    case 'double':
      return <Double key={field.code} {...dilver} />
    case 'dateTime':
      return <DateTime key={field.code} {...dilver} />
    case 'richText':
      return <RichText key={field.code} {...dilver} />
    case 'table':
      return <TableData key={field.code} {...dilver} isRequired={field.isRequired} />
    case 'attachfile':
      return <Attachfile key={field.code} {...dilver} />
    case 'resource':
      return <Resource key={field.code} {...dilver} />
    case 'user':
      return <User key={field.code} {...dilver} />
    case 'department':
      return <Department key={field.code} {...dilver} />
    case 'userGroup':
      return <UserGroup key={field.code} {...dilver} />
    case 'treeSel':
      return <TreeSel key={field.code} {...dilver} />
    case 'securityCode':
      return <SecurityCode key={field.code} {...dilver} />
    case 'topology':
      return <Topology key={field.code} {...dilver} />
    case 'timeInterval':
      return <TimeInterval key={field.code} {...dilver} />
    case 'excelImport':
      return <ExcelImport key={field.code} {...dilver} />
    case 'customizeTable':
      return <CustomizeTable key={field.code} {...dilver} />
    case 'job':
      return <RelatedJob key={field.code} {...dilver} />
    case 'tags':
      return <Tags key={field.code} {...dilver} />
    case 'links':
      return <LinksField key={field.code} {...dilver} />
    case 'nodeExecution':
      return <NodeExecution key={field.code} {...dilver} />
    case 'permission':
      return <Permission key={field.code} {...dilver} />
    case 'jsontext':
      return <JSONTEXT key={field.code} {...dilver} />
    case 'sla':
      return (
        <Sla
          key={field.id}
          {...dilver}
          fold={dilver.foldSource === 'setting' ? 0 : field.fold}
          isInLayout
        />
      )
    case 'ola':
      return (
        <Ola
          key={field.id}
          {...dilver}
          fold={dilver.foldSource === 'setting' ? 0 : field.fold}
          isInLayout
        />
      )
    case 'iframe':
      return (
        <Iframe
          key={field.id}
          {...dilver}
          fold={dilver.foldSource === 'setting' ? 0 : field.fold}
        />
      )
    case 'relateTicket':
      return (
        <RelateTicket
          key={field.id}
          {...dilver}
          fold={dilver.foldSource === 'setting' ? 0 : field.fold}
          getCurrentTicketValue={dilver.getFormsValue || dilver.getCurrentTicketValue}
          formList={dilver.forms}
          isInLayout
        />
      )
    case 'btn':
      return <Btn key={field.id} {...dilver} />
    case 'nestedTable':
      return <NestedTable key={field.id} {...dilver} />
    case 'relateSubProcess':
      return (
        <RelateSubProcess
          key={field.id}
          {...dilver}
          fold={dilver.foldSource === 'setting' ? 0 : field.fold}
          getCurrentTicketValue={dilver.getFormsValue || dilver.getCurrentTicketValue}
          formList={dilver.forms}
          isInLayout
        />
      )
    case 'relate_job':
      return (
        <RelateAutoJob
          key={field.id}
          {...dilver}
          fold={dilver.foldSource === 'setting' ? 0 : field.fold}
          getCurrentTicketValue={dilver.getFormsValue || dilver.getCurrentTicketValue}
          formList={dilver.forms}
        />
      )
    case 'operateRecord':
      return <ProcessRecord key={field.id} {...dilver} isInLayout />
    case 'mergeTicket':
      return <MergeTicket key={field.id} {...dilver} isInLayout />
    case 'remoteTicket':
      return <RemoteTicket key={field.id} {...dilver} isInLayout />
    case 'ticketComment':
      return <TicketComment key={field.id} {...dilver} isInLayout />
    case 'ticketField':
      if (['flowNo', 'modelName', 'status', 'createTime'].includes(field.code)) {
        return <SingleRowText key={field.code} {...dilver} />
      } else if (field.code === 'currentTache') {
        return <CurrentTacheForm key={field.id} {...dilver} />
      } else if (field.code === 'creator') {
        return <Creator key={field.id} {...dilver} />
      } else if (field.code === 'excutorAndGroup') {
        return <ExcutorAndGroup key={field.id} {...dilver} />
      } else if (field.code === 'slaStatus') {
        return <SlaStatus key={field.id} {...dilver} />
      } else if (field.code === 'olaStatus') {
        return <OlaStatus key={field.id} {...dilver} />
      } else if (field.code === 'currentStage') {
        return <CurrentStage key={field.id} {...dilver} />
      } else {
        return null
      }
    default:
      return <CustomizeField key={field.code} {...dilver} />
  }
}
