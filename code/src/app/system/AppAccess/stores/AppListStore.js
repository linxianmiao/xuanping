import TableStore from '~/stores/TableStore'

export default class AppListStore extends TableStore {
  totalKey = 'count'

  // 获取应用列表
  queryFunc = params => axios.get(API.queryAppAccessList, { params })
}
