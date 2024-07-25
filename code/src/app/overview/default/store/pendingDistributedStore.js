import { observable, action } from 'mobx'
import { allColor } from '~/components/ColorPicker/logic'

class PendingDistributedStore {
  @observable options = {}

  @observable skin = document.querySelector('html').classList.contains('blue') ? 'blue' : 'white'

  getDefalutOption(priorityList) {
    const data = []
    priorityList.map((item, i) => {
      data.push({
        value: 0,
        name: item.name,
        itemStyle: {
          normal: {
            color: item.color || allColor[i]
          }
        }
      })
    })
    const option = {
      title: {
        text: '',
        textStyle: {
          fontSize: 24
        },
        subtext: i18n('tip5', '待处理工单'),
        x: 'center',
        y: '44%'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      // color: ["#EC4E53", "#F99C05", "#FDD74A", "#30D85C", "#4ABAFD"],
      series: [
        {
          name: i18n('tip6'),
          type: 'pie',
          radius: ['55%', '70%'],
          center: ['50%', '50%'],
          data: data,
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    return option
  }

  @action setSkin(value) {
    this.options = _.merge({}, this.options, {
      title: {
        textStyle: {
          color: value === 'blue' ? '#FFFFFF' : '#4C5159'
        },
        subtextStyle: {
          color: value === 'blue' ? '#6CA4CD' : '#828B99'
        }
      }
    })
  }

  @action getTicketChart(priorityList) {
    axios.get(API.default_priority_distribution).then((res) => {
      let total = 0
      let options = {}
      const response = res || []
      if (response.length > 0) {
        const data = []
        _.map(response, (item, i) => {
          const priority = priorityList.find((p) => p.value == item.value)
          total += item.num
          data.push({
            value: item.num,
            name: item.urgent_level,
            priority: item.value,
            itemStyle: {
              normal: {
                color: priority ? priority.color : allColor[i]
              }
            }
          })
        })
        options = _.merge({}, this.getDefalutOption(priorityList), {
          title: {
            text: total,
            textStyle: {
              color: this.skin === 'blue' ? '#FFFFFF' : '#4C5159'
            },
            subtextStyle: {
              color: this.skin === 'blue' ? '#6CA4CD' : '#828B99'
            }
          }
        })
        options.series[0].data = data
      } else {
        options = _.merge({}, this.getDefalutOption(priorityList))
      }
      this.options = options
    })
  }
}

export default PendingDistributedStore
