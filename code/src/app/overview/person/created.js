import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Row, Col, Title } from '@uyun/components'
import { observer, inject } from 'mobx-react'
import PieChart from './pieChart'
import CreatedTable from './createdTable'

@inject('createdChartStore')
@observer
class Created extends Component {
  componentDidMount() {
    this.props.createdChartStore.getCreatedChart()
    window.changeSkin_hook_created = () => {
      const skin = document.querySelector('html').classList.contains('blue') ? 'blue' : 'white'
      this.props.createdChartStore.setSkin(skin)
    }
  }

  componentWillUnmount() {
    window.changeSkin_hook_created = () => {}
  }

  render() {
    return (
      <div className="overview-person-ticket-wrap">
        <Title
          extra={
            <Link className="check-more" to="/ticket/mycreate">
              {i18n('more', '查看更多')}
            </Link>
          }
        >
          <span>
            {i18n('created_ticket', '我创建的工单')}({this.props.createdChartStore.total})
          </span>
        </Title>
        <Row className="overview-person-ticket-content">
          <Col className="overview-person-ticket-chart" span={8}>
            <PieChart store={this.props.createdChartStore} />
            <p className="overview-person-ticket-chart-title">{i18n('tip27', '工单状态分布')}</p>
          </Col>
          <Col className="overview-person-ticket-table" span={16}>
            <CreatedTable />
          </Col>
        </Row>
      </div>
    )
  }
}

export default Created
