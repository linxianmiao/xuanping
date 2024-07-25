import moment from 'moment'

export function detailTime (query, allField) {
  const filter = _.cloneDeep(query)
  if (allField) {
    const { builtinFields, extendedFields } = allField
    const timeList = [...builtinFields, ...extendedFields].filter(item => item.type === 'dateTime').map(item => item.code)
    for (const key in filter) {
      if (_.includes(timeList, key) && filter[key]) {
        filter[key] = [`${moment(filter[key][0]).format('YYYY-MM-DD')} 00:00:00`, `${moment(filter[key][1]).format('YYYY-MM-DD')} 23:59:59`]
      }
    }
  }
  if (!_.isEmpty(filter.create_time)) {
    filter.create_time = [`${moment(filter.create_time[0]).format('YYYY-MM-DD')} 00:00:00`, `${moment(filter.create_time[1]).format('YYYY-MM-DD')} 23:59:59`]
  }
  if (!_.isEmpty(filter.update_time)) {
    filter.update_time = [`${moment(filter.update_time[0]).format('YYYY-MM-DD')} 00:00:00`, `${moment(filter.update_time[1]).format('YYYY-MM-DD')} 23:59:59`]
  }
  return filter
}
