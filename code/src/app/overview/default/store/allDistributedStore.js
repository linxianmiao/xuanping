import { observable, action } from 'mobx'

class AllDistributedStore {
  @observable type = '1'

  @observable options = {}

  getDefault (type) {
    const names = ['', i18n('tip7', '工单模型'), i18n('tip8', '来源'), i18n('tip9', '状态')]
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      series: [
        {
          name: names[type],
          type: 'pie',
          center: ['50%', '55%'],
          radius: ['0%', '60%'],
          data: [],
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
  }

  @action setType (value) {
    this.type = value
  }

  @action getDistributed (params) {
    axios.get(API.default_distribution, { params: params }).then(res => {
      const type = this.type
      let options = {}
      const data = []
      const colors = {
        1: ['#4abafd', '#30D85C', '#f99c05', '#e2bd1b', '#6b2dda', '#9ea0b6'],
        2: {
          ALERT: '#f99c05',
          alert: '#f99c05',
          wechat: '#30D85C',
          import: '#e2bd1b',
          web: '#8857E1',
          cmdb: '#bd10e0',
          chatops: '#4abafd',
          srvcat: '#376ED0'
        },
        3: {
          1: '#4abafd',
          2: '#30d85c',
          3: '#376ED0',
          7: '#24cbca',
          10: '#ec4e53'
        }
      }
      _.map(res, (item, i) => {
        if (type === '1') {
          data.push({
            value: item.count,
            name: item.name,
            id: item.id,
            using: item.using
          })
          options = _.merge({}, this.getDefault(type), {
            color: colors[type],
            series: [{
              data: data.map(item => item.using ? item : _.assign({}, item, { cursor: 'default' }))
            }]
          })
        } else {
          const index = type === '2' ? 'source' : 'status'
          const other = type === '2' ? '#9ea0b6' : '#f99c05'
          const filters = _.filter(colors[type], (o, key) => {
            return item[index] === key
          })
          data.push({
            value: item.count,
            name: item.name,
            id: item.id,
            source: item.source,
            status: item.status,
            itemStyle: {
              normal: {
                color: filters.length ? filters[0] : other
              }
            }
          })
          options = _.merge({}, this.getDefault(type), {
            series: [{
              // data: data.map(item => _.assign({}, item, { cursor: 'no-drop' }))
              data: data.map(item => _.assign({}, item, { cursor: 'pointer' }))
            }]
          })
        }
      })
      this.options = options
    })
  }

  @action disposer () {
    this.type = '1'
    this.options = {}
  }
}

export default AllDistributedStore
