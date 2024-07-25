import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import { autorun } from 'mobx'
import { observer } from 'mobx-react'
import { DatePicker, Select, Title, Tooltip, Card } from '@uyun/components'
import LineChart from './lineChart'
const { RangePicker } = DatePicker
const Option = Select.Option
const fmt = 'YYYY-MM-DD'

@withRouter
@observer
class TicketCount extends Component {
  componentDidMount() {
    this.props.store.getUserModels()
    this.disposer = autorun(() => {
      const { times, models } = this.props.store
      const data = {
        begin_time: times[0],
        end_time: times[1]
      }
      const urlArr = []
      if (models.length) {
        _.map(models, (item) => {
          urlArr.push(`model_id=${item}`)
        })
      }
      const skin = document.querySelector('html').classList.contains('blue') ? 'blue' : 'white'
      const url = urlArr.join('&')
      this.props.store.getStatistics(data, url, skin)
    })
    window.changeSkin_hook_ticket_count = () => {
      const skin = this.props.runtime.theme
      this.props.store.setSkin(skin)
    }
  }

  onRangeChange = (values) => {
    const times = [values[0].format(fmt), values[1].format(fmt)]
    this.props.store.setTimes(times)
  }

  onSelect = (values) => {
    this.props.store.setModels(values)
  }

  onClick = (params) => {
    const index = params.seriesIndex
    const models = this.props.store.models
    const fmt = 'YYYY-MM-DD HH:mm:ss'
    const create_time = moment(params.name).format(fmt)
    const end_time = moment(params.name).add(1, 'days').format(fmt)
    const query = { create_time, end_time }
    if (models.length) {
      query.modelId = models.join('_')
    }
    if (index === 1) {
      this.props.history.push({ pathname: '/ticket/all', query: query })
    }
    if (index === 2) {
      query['query_all'] = 1
      query['status'] = '3_7'
      this.props.history.push({ pathname: '/ticket/all', query: query })
    }
  }

  componentWillUnmount() {
    this.disposer()
    this.props.store.disposer()
    window.changeSkin_hook_ticket_count = () => {}
  }

  render() {
    const selectArr = this.props.store.selectArr
    const start = moment().subtract(30, 'days')
    const end = moment().subtract(1, 'days')
    const disabled = (current) => {
      return current && current.valueOf() > moment().subtract(1, 'days').valueOf()
    }
    return (
      <div className="overview-default-public-wrap overview-default-tickt-trend">
        <Title
          extra={
            <div>
              <Select
                size="small"
                allowClear
                showSearch
                mode="multiple"
                optionFilterProp="children"
                notFoundContent={i18n('globe.not_find', '无法找到')}
                style={{ width: 200, marginRight: 10, verticalAlign: 'middle' }}
                onChange={this.onSelect}
                getPopupContainer={() => document.querySelector('#itsm-wrap')}
                placeholder={i18n('tip1', '请选择工单模型')}
              >
                {_.map(selectArr, (item, i) => {
                  return (
                    <Option value={item.processId} key={i}>
                      <Tooltip placement="right" title={item.processName}>
                        {item.processName}
                      </Tooltip>
                    </Option>
                  )
                })}
              </Select>
              <RangePicker
                size="small"
                allowClear={false}
                style={{ verticalAlign: 'middle' }}
                defaultValue={[start, end]}
                format={fmt}
                disabledDate={disabled}
                getCalendarContainer={() => document.querySelector('#itsm-wrap')}
                onChange={this.onRangeChange}
              />
            </div>
          }
        >
          {i18n('statistics', '工单统计')}
        </Title>
        <Card bodyStyle={{ height: 360 }}>
          <LineChart store={this.props.store} onClick={this.onClick} />
        </Card>
      </div>
    )
  }
}

export default TicketCount
