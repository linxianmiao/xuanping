import React, { Component } from 'react'
import { DragSource } from 'react-dnd'
import Group from './group'
import Tabs from './tabs'
import Iframe from './iframe'
import Sla from './sla'
import Ola from './ola'
import SubForm from './subForm'
import RelateTicket from './RelateTicket'
import RelateSubProcess from './RelateSubProcess'
import RelateAutoJob from './RelateAutoJob'
import ProcessRecord from './ProcessRecord'
import MergeTicket from './MergeTicket'
import RemoteTicket from './RemoteTicket'
import TicketComment from './TicketComment'
import Panel from './panel'

import Type from '../type'

const layoutSource = {
  beginDrag(props) {
    const { layoutIndex, formLayout, parentType } = props
    props.handleSideShow(null, 'side')
    return {
      action: 'move',
      beginField: formLayout,
      beginLayoutIndex: layoutIndex,
      beginParentType: parentType,
      id: formLayout.id,
      type: formLayout.type
    }
  }
}
@DragSource(Type, layoutSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
class Layout extends Component {
  renderLayout = () => {
    const { type } = this.props.formLayout
    switch (type) {
      case 'tab':
        return <Tabs {...this.props} />
      case 'group':
        return <Group {...this.props} />
      case 'iframe':
        return <Iframe {...this.props} />
      case 'sla':
        return <Sla {...this.props} />
      case 'ola':
        return <Ola {...this.props} />
      case 'subForm':
        return <SubForm {...this.props} />
      case 'relateTicket':
        return <RelateTicket {...this.props} />
      case 'relateSubProcess':
        return <RelateSubProcess {...this.props} />
      case 'relate_job':
        return <RelateAutoJob {...this.props} />
      case 'operateRecord':
        return <ProcessRecord {...this.props} />
      case 'mergeTicket':
        return <MergeTicket {...this.props} />
      case 'remoteTicket':
        return <RemoteTicket {...this.props} />
      case 'ticketComment':
        return <TicketComment {...this.props} />
      case 'panel':
        return <Panel {...this.props} />
      default:
        return null
    }
  }

  render() {
    const { connectDragSource } = this.props
    return connectDragSource(<div className="layout-item">{this.renderLayout()}</div>)
  }
}
export default Layout
