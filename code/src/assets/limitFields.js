const multiple = window.language === 'zh_CN' ? 1 : 3

export default {
  config: {
    defaultValue: 100 * multiple,
    textarea: 500 * multiple,
    description: 500 * multiple,
    options: 10 * multiple,
    modelDesc: 50 * multiple,
    triggrTen: 20 * multiple,
    triggrFifty: 50 * multiple,
    orgName: 7 * multiple,
    userName: 7 * multiple,
    modelName: 20 * multiple,
    modelProcessName: 10 * multiple
  },
  ticket: {
    ticketDesc: 500 * multiple,
    content: 50 * multiple,
    creatTitle: 30 * multiple,
    viewName: 10 * multiple,
    table_columns: 10 * multiple
  },
  catlot: {
    catlogName: 15 * multiple,
    title: 15 * multiple,
    desc: 150 * multiple,
    serviceTimeName: 20 * multiple
  },
  model: {
    proRuleName: 10 * multiple,
    RuleExplain: 20 * multiple
  },
  SLA: {
    name: 20 * multiple,
    desc: 50 * multiple
  },
  field: {
    table_columns: 30 * multiple
  },
  trigger: {
    title: 50 * multiple,
    content: 500 * multiple
  }
}
