import dataBaseStore from '~/stores/dataBaseStore'

/**
 *
 * @param {Object} data  传入参数的集合
 *  pageNo
 * pageSize
 * columns表示取某些列的数据
 * code 数据表code
 * conditions 查询条件的对象集合
 */
const queryAllData = async (data = {}) => {
  const code = data?.code || ''
  const appkey = _.get(data, 'appkey') || ''
  const requiredFields = _.get(data, 'requiredFields')
  if (!_.isEmpty(code)) {
    let params = {
      pageNo: _.get(data, 'pageNo') || 1,
      pageSize: _.get(data, 'pageSize')
        ? _.get(data, 'pageSize') > 100
          ? 100
          : _.get(data, 'pageSize')
        : 10,
      dataSetCode: code,
      conditions: _.get(data, 'conditions') || {},
      requiredFields: requiredFields
    }
    const res = (await dataBaseStore.queryDataRow(params, appkey)) || {}
    return res?.list || []
  } else {
    return false
  }
}

/**
 *
 * @param {Object} data
 * dataRowId是某行数据的dataSetItemId
 * requiredFields表示取某些列的数据
 */
const getSingleData = async (data = {}) => {
  let appkey = _.get(data, 'appkey') || ''
  let requiredFields = _.get(data, 'requiredFields') || ''
  requiredFields = !_.isEmpty(requiredFields) && requiredFields?.split(',')
  let params = {
    dataSetItemId: _.get(data, 'dataRowId')
  }
  if (appkey) {
    params.appkey = appkey
  }

  let res = await dataBaseStore.getDataSetItem(params)
  let List = _.cloneDeep(res?.itemData) || {}
  if (Array.isArray(requiredFields)) {
    _.forIn(List, (value, key) => {
      if (!_.includes(requiredFields, key)) {
        delete List[key]
      }
    })
  }
  return List
}

export { queryAllData, getSingleData }
