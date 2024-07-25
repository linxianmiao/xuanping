import * as R from 'ramda'

export function getDataSource(rowList) {
  return rowList.map((row) => {
    // 服务端用户和用户组type是字符串类型
    // UserPicer接收type为数字类型
    const colObj = row.columns.reduce(
      (acc, { columnId, valueList }) => ({
        ...acc,
        [columnId]: valueList.map((item) => ({ ...item, type: Number(item.type) }))
      }),
      {}
    )
    return { ...row, ...colObj }
  })
}

export const updateWhen = (condition, updater, array) =>
  array.map((item, index) => (condition(item, index) ? updater(item, index) : item))

const getValidateInfo = R.curry((validateStatus, help, type, payload) => ({
  validateStatus,
  help,
  type,
  payload
}))

export const getInitialValidateInfo = () => ({
  validateStatus: '',
  help: '',
  // column row 标志错误信息的种类，来决定将错误信息放在表头或者单元格中
  type: '',
  payload: null
})

// 列为空只需要columnId就能定位; 单元格为空，则需要rowId和columnId共同定位
function columnNameNotEmpty(columns) {
  const success = getValidateInfo('', '', 'column', null)
  const error = getValidateInfo('error', i18n('column-name-cant-empty', '列名不能为空'), 'column')
  const emptyColumns = columns.filter((c) => _.isEmpty(c.columnName))
  if (emptyColumns.length > 0) return error(R.pluck('columnId', emptyColumns))
  return success
}

function cellNotEmpty(columns, rows) {
  const success = getValidateInfo('', '', 'row', null)
  const error = getValidateInfo(
    'error',
    i18n('system-matrix-cell-not-empty', '矩阵元素不能为空'),
    'row'
  )
  const emptyRows = {}
  rows.forEach((row) => {
    if (_.isEmpty(row.columns)) {
      emptyRows[row.rowId] = R.pluck('columnId', columns)
    } else {
      const emptyColumns = row.columns.filter((c) => _.isEmpty(c.valueList))
      if (emptyColumns.length > 0) {
        emptyRows[row.rowId] = R.pluck('columnId', emptyColumns)
      }
    }
  })
  return Object.keys(emptyRows).length > 0 ? error(emptyRows) : success
}

export const validateRules = [columnNameNotEmpty, cellNotEmpty]
