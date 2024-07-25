import { observable, action } from 'mobx'
import moment from 'moment'
const fmt = 'YYYY-MM-DD'

class TicketTrendStore {
  @observable times = [moment().subtract(30, 'days').format(fmt), moment().subtract(1, 'days').format(fmt)]

  @observable options = {}

  getDefault () {
    return {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '30',
        containLabel: true
      },
      legend: {
        left: 0
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: false,
          axisLine: {
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          splitLine: {
            show: false
          }

        }
      ]
    }
  }

  @action setTimes (times) {
    this.times = times
  }

  @action setSkin (value) {
    const options = _.merge({}, this.options, {
      legend: {
        textStyle: {
          color: value === 'blue' ? '#FFFFFF' : '#828B99'
        }
      },
      xAxis: [{
        axisLine: {
          lineStyle: {
            color: value === 'blue' ? '#FFFFFF' : '#828B99'
          }
        }
      }],
      yAxis: [{
        axisLine: {
          lineStyle: {
            color: value === 'blue' ? '#FFFFFF' : '#828B99'
          }
        }
      }]
    })
    this.options = options
  }

  @action getTicketTrend (data, skin) {
    const params = data || {}
    axios.get(API.default_get_trend, {
      params: params
    }).then(res => {
      const legend = [i18n('tip10', '工单创建数'), i18n('tip11', '工单完成数'), i18n('tip12', '工单逾期数')]
      const { time, total_count, finish_count, overdue_count } = res || {}
      const _options = {
        legend: {
          data: legend,
          textStyle: {
            color: skin === 'blue' ? '#FFFFFF' : '#828B99'
          }
        },
        xAxis: [{
          data: time,
          axisLine: {
            lineStyle: {
              color: skin === 'blue' ? '#FFFFFF' : '#828B99'
            }
          }
        }],
        yAxis: [{
          axisLine: {
            lineStyle: {
              color: skin === 'blue' ? '#FFFFFF' : '#828B99'
            }
          }
        }],
        color: ['#4ABAFD', '#30D85C', '#EC4E53'],
        series: [
          {
            name: legend[0],
            type: 'line',
            symbol: 'circle',
            smooth: true,
            areaStyle: { normal: {
              color: '#4ABAFD',
              opacity: 0.3
            } },
            data: total_count
          },
          {
            name: legend[1],
            type: 'line',
            symbol: 'circle',
            smooth: true,
            areaStyle: { normal: {
              color: '#30D85C',
              opacity: 0.3
            } },
            data: finish_count
          },
          {
            name: legend[2],
            type: 'line',
            symbol: 'none',
            smooth: true,
            areaStyle: { normal: {
              color: '#EC4E53',
              opacity: 0.3
            } },
            data: overdue_count
          }
        ]

      }
      this.options = _.merge({}, this.getDefault(), _options)
    })
  }

  @action disposer () {
    this.times = [moment().subtract(30, 'days').format(fmt), moment().subtract(1, 'days').format(fmt)]
    this.options = {}
  }
}

export default TicketTrendStore
