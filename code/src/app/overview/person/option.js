export default {
  title: {
    text: 0,
    textStyle: {
      fontSize: 24
    },
    subtextStyle: {},
    x: 'center',
    y: '40%'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)'
  },
  // color: ["#6C7480", "#828B99", "#ACB3BE", "#CED2D9", "#4C5159"],
  series: [
    {
      name: i18n('tip6', '优先级'),
      type: 'pie',
      radius: ['45%', '60%'],
      center: ['50%', '45%'],
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
