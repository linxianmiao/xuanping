import { observable, action } from 'mobx'
import option from '../option'

export default class CreatedChartStore {
  getDefault() {
    const colors = ['#6C7480', '#828B99', '#ACB3BE', '#CED2D9', '#4C5159']
    const levels = [
      i18n('status_1', '待处理'),
      i18n('status_3', '已完成'),
      i18n('status_10', '挂起'),
      i18n('status_7', '已关闭'),
      i18n('status_2', '处理中')
    ]
    const data = []
    colors.map((item, i) => {
      data.push({
        value: 0,
        name: levels[i],
        itemStyle: {
          normal: {
            color: colors[i]
          }
        }
      })
    })
    return {
      title: {
        subtext: i18n('tip28', '创建的工单'),
        text: 0,
        textStyle: {
          color: this.skin === 'blue' ? '#FFFFFF' : '#4C5159'
        },
        subtextStyle: {
          color: this.skin === 'blue' ? '#6CA4CD' : '#828B99'
        }
      },
      subtextStyle: {
        color: this.skin === 'blue' ? '#6CA4CD' : '#828B99'
      },
      series: [
        {
          data: data
        }
      ]
    }
  }

  @observable skin = document.querySelector('html').classList.contains('blue') ? 'blue' : 'white'

  @observable options = {}

  @observable total = 0

  @action getCreatedChart() {
    axios.get(API.person_status).then((res) => {
      const colors = {
        1: '#4abafd',
        2: '#30d85c',
        3: '#376ED0',
        7: '#24cbca',
        10: '#ec4e53'
      }
      const data = []
      let total = 0
      let options = {}
      if (res.length === 0) {
        options = _.merge({}, option, this.getDefault())
      } else {
        _.map(res, (item, i) => {
          const filter = _.filter(colors, (o, key) => {
            return item.status === key
          })
          total += item.count
          data.push({
            value: item.count,
            name: item.name,
            itemStyle: {
              normal: {
                color: filter.length ? filter[0] : '#f99c05'
              }
            }
          })
        })
        options = _.merge({}, option, this.getDefault(), {
          title: {
            text: total
          }
        })
      }
      options.series[0].name = i18n('ticket.list.status', '工单状态')
      options.series[0].data = data
      this.total = total
      this.options = options
    })
  }

  @action setSkin(value) {
    const options = _.merge({}, this.options, {
      title: {
        textStyle: {
          color: value === 'blue' ? '#FFFFFF' : '#4C5159'
        },
        subtextStyle: {
          color: value === 'blue' ? '#6CA4CD' : '#828B99'
        }
      },
      subtextStyle: {
        color: value === 'blue' ? '#6CA4CD' : '#828B99'
      }
    })
    this.options = options
  }
}
