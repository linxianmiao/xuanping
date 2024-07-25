import React, { Component } from 'react'
import { Collapse } from '@uyun/components'
import Table from './Table'

class Sla extends Component {
  state = {
    data: []
  }

  componentDidMount() {
    const { ticketId } = this.props

    if (ticketId) {
      this.querySla(ticketId)
    }
  }

  querySla = async (ticketId) => {
    const res = (await axios.get(API.GET_TICKET_SLA_LIST, { params: { ticketId } })) || []

    this.setState({ data: res })
  }

  render() {
    const { name, height = 500, styleAttribute } = this.props.field || {}
    const { fold, isInLayout } = this.props
    const { data } = this.state
    const tableProps = { data }
    const wrapStyle = {
      height: height + 'px',
      overflowY: 'auto'
    }
    if (isInLayout) {
      return (
        <div
          style={
            Number(height) === 0
              ? { overflow: 'visible' }
              : { maxHeight: height + 'px', overflow: 'scroll' }
          }
        >
          <Table {...tableProps} formMode="new" />
        </div>
      )
    }
    return (
      <div className="forms-group-wrap">
        <Collapse defaultActiveKey={fold === 0 ? ['1'] : []}>
          <Collapse.Card key="1" header={name} forceRender>
            <div style={wrapStyle}>
              <Table {...tableProps} />
            </div>
          </Collapse.Card>
        </Collapse>
      </div>
    )
  }
}

export default Sla
