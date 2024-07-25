import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { DatePicker, Title, Card } from '@uyun/components'
import { autorun } from 'mobx'
import { observer } from 'mobx-react'
import moment from 'moment'
import LineChart from './lineChart'
const { RangePicker } = DatePicker
const fmt = 'YYYY-MM-DD'

@withRouter
@observer
class TicketTrend extends Component {
  componentDidMount() {
    this.disposer = autorun(() => {
      const data = {
        begin_time: this.props.ticketTrendStore.times[0],
        end_time: this.props.ticketTrendStore.times[1]
      }
      const skin = document.querySelector('html').classList.contains('blue') ? 'blue' : 'white'
      this.props.ticketTrendStore.getTicketTrend(data, skin)
    })
    window.changeSkin_hook_ticket_trend = () => {
      const skin = document.querySelector('html').classList.contains('blue') ? 'blue' : 'white'
      this.props.ticketTrendStore.setSkin(skin)
    }
  }

  onRangeChange = (values) => {
    if (values) {
      const times = [values[0].format(fmt), values[1].format(fmt)]
      this.props.ticketTrendStore.setTimes(times)
    }
  }

  onClick = (params) => {
    const fmt = 'YYYY-MM-DD HH:mm:ss'
    const create_time = moment(params.name).format(fmt)
    const end_time = moment(params.name).add(1, 'days').format(fmt)
    if (params.seriesIndex === 0) {
      this.props.history.push({
        pathname: '/ticket/all',
        query: {
          create_time,
          end_time
        }
      })
    }
    if (params.seriesIndex === 1) {
      this.props.history.push({
        pathname: '/ticket/all',
        query: {
          create_time,
          end_time,
          query_all: 1,
          status: '3_7'
        }
      })
    }
  }

  componentWillUnmount() {
    this.disposer()
    this.props.ticketTrendStore.disposer()
    window.changeSkin_hook_ticket_trend = () => {}
  }

  render() {
    const start = moment().subtract(30, 'days')
    const end = moment().subtract(1, 'days')
    const disabled = (current) => {
      return current && current.valueOf() > moment().subtract(1, 'days').valueOf()
    }
    return (
      <div className="overview-default-public-wrap overview-default-tickt-trend">
        <Title
          extra={
            <RangePicker
              size="small"
              format={fmt}
              allowClear={false}
              defaultValue={[start, end]}
              disabledDate={disabled}
              onChange={this.onRangeChange}
              getCalendarContainer={() => document.querySelector('#itsm-wrap')}
            />
          }
        >
          {i18n('ticket_trend', '工单趋势')}
        </Title>
        <Card bodyStyle={{ height: 360 }}>
          <LineChart store={this.props.ticketTrendStore} onClick={this.onClick} />
        </Card>
      </div>
    )
  }
}

export default TicketTrend
