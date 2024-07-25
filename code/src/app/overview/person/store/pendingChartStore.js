import { observable, action } from 'mobx'
import option from '../option'

/**
 * 处理字符串换行
 * @param {String} str 原字符串
 * @param {Number} length 一行的长度。1个中文占2个单位，其余类型的字符串占1个单位
 * @returns {String} 添加\n后的字符串
 */
function wordBreak(str, lineSize = 6) {
  if (typeof str !== 'string') {
    return ''
  }

  const pattern = new RegExp('[\u4E00-\u9FA5]+')
  const cache = []

  Array.from(str).forEach((s) => {
    const size = pattern.test(s) ? 2 : 1
    cache.push({ value: s, size })
  })

  let result = ''
  let currentLineSize = 0
  const len = cache.length

  cache.forEach((item, index) => {
    result += item.value
    currentLineSize += item.size

    if (currentLineSize >= lineSize && index < len - 1) {
      result += '\n'
      currentLineSize = 0
    }
  })

  return result
}

export default class PendingChartStore {
  getDefault() {
    const colors = ['#6C7480', '#828B99', '#ACB3BE', '#CED2D9', '#4C5159']
    const levels = [
      i18n('none', '极低'),
      i18n('low', '低'),
      i18n('normal', '中'),
      i18n('high', '高'),
      i18n('urgent', '极高')
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
        subtext: i18n('tip5', '待处理工单'),
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

  @action getPendingChart() {
    axios.get(API.getTicketCountByModel).then((res) => {
      const colors = ['#4ABAFD', '#30D85C', '#FDD74A', '#F99C05', '#EC4E53']
      const data = []
      let total = 0
      let options = {}

      if (res && res.length > 0) {
        res.map((item, i) => {
          total += item.count
          data.push({
            value: item.count,
            name: item.name,
            modelId: item.id,
            itemStyle: {
              normal: {
                color: colors[i]
              }
            }
          })
        })

        options = _.merge({}, option, this.getDefault(), {
          title: {
            text: total
          }
        })
        options.series[0].name = i18n('layout_model', '模型')
        options.series[0].data = data
        options.series[0].label = {
          normal: {
            formatter: (param) => wordBreak(param.name)
          }
        }
      }

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
