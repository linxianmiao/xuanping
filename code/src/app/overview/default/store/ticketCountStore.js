import { observable, action } from 'mobx'
import moment from 'moment'
const fmt = 'YYYY-MM-DD'

class TicketCountStore {
  @observable selectArr = []

  @observable times = [moment().subtract(30, 'days').format(fmt), moment().subtract(1, 'days').format(fmt)]

  @observable models = []

  @observable options = {}

  getDefault (skin) {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '30',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          boundaryGap: true,
          data: [],
          axisLine: {
            lineStyle: {
              color: skin === 'blue' ? '#FFFFFF' : '#828B99'
            }
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          splitLine: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: skin === 'blue' ? '#FFFFFF' : '#828B99'
            }
          }
        },
        {
          name: i18n('tip4', '解决率') + '(%)',
          type: 'value',
          splitLine: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: skin === 'blue' ? '#FFFFFF' : '#828B99'
            }
          }
        }
      ],
      color: ['#EC4E53', '#FDD74A', '#30D85C', '#4ABAFD'],
      series: []
    }
  }

  @action getUserModels () {
    axios.get(API.default_get_module).then(res => {
      this.selectArr = res
    })
  }

  @action setTimes (times) {
    this.times = times
  }

  @action setModels (values) {
    this.models = values
  }

  @action setSkin (value) {
    const options = {
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
      }, {
        axisLine: {
          lineStyle: {
            color: value === 'blue' ? '#FFFFFF' : '#828B99'
          }
        }
      }]
    }
    _.forEach(this.options.legend, leg => {
      leg.textStyle.color = value === 'blue' ? '#FFFFFF' : '#828B99'
    })
    this.options = _.merge({}, this.options, options)
  }

  @action getStatistics (data, url, skin) {
    const path = url ? `${API.default_statistics}?${url}` : API.default_statistics
    axios.get(path, { params: data }).then(res => {
      const { time, overdue_count, today_create_count, today_finish_count, resolution_rate } = res || {}
      const legend = [
        i18n('tip3', '今日逾期'),
        i18n('added', '今日新增'),
        i18n('tip2', '今日完成'),
        i18n('tip4', '解决率')
      ]
      const _options = {
        xAxis: [{
          data: time
        }],
        series: [{
          name: legend[0],
          type: 'bar',
          data: overdue_count
        },
        {
          name: legend[1],
          type: 'bar',
          data: today_create_count
        },
        {
          name: legend[2],
          type: 'bar',
          data: today_finish_count
        },
        {
          name: legend[3],
          type: 'line',
          symbol: 'none',
          smooth: true,
          yAxisIndex: 1,
          data: resolution_rate
        }],
        legend: [{
          data: [legend[0], legend[1]],
          left: 0,
          top: 0,
          textStyle: {
            color: skin === 'blue' ? '#FFFFFF' : '#828B99'
          }
        }, {
          data: [legend[2], legend[3]],
          top: 20,
          left: 0,
          textStyle: {
            color: skin === 'blue' ? '#FFFFFF' : '#828B99'
          }
        }]
      }
      this.options = _.merge({}, this.getDefault(skin), _options)
    })
  }

  @action disposer () {
    this.selectArr = []
    this.times = [moment().subtract(30, 'days').format(fmt), moment().subtract(1, 'days').format(fmt)]
    this.models = []
    this.options = {}
  }
}

export default TicketCountStore
