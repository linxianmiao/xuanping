// 写死的列key，不包括固定列
export const DEFAULT_COLUMN_KEYS = [
  'className',
  'name',
  'status',
  'operation',
  'delete',
  'sandboxImportInfo'
]

export const LIFECYCLESTATE = {
  inventory: i18n('inventory', '库存'),
  installing: i18n('installing', '上架中'),
  using: i18n('using', '使用'),
  modifying: i18n('modifying', '变更中'),
  transfering: i18n('transfering', '调拨中'),
  repair: i18n('repair', '维修'),
  dismantle: i18n('dismantle', '下架中'),
  scraping: i18n('scraping', '报废中'),
  scrap: i18n('scrap', '报废'),
  uninventory: i18n('uninventory', '未入库'),
  pending: i18n('pending', '待入库')
}

export function getStatusName(status) {
  switch (status) {
    case '0':
    case '4':
      return i18n('ticket.create.related', '已关联')
    case '1':
      return i18n('ticket.create.updating', '更新中')
    case '2':
      return i18n('ticket.create.effect', '已生效')
    case '3':
      return i18n('ticket.create.conflict_status', '已取消')
    case '5':
      return i18n('ticket.create.creating', '计划新增')
    case '6':
      return i18n('ticket.create.plan_delete', '计划删除')
    case '7':
      return i18n('ticket.create.cmdb_delete', 'CMDB中已删除')
    case '9':
      return i18n('ticket.create.no_operate', '无操作')
    case '10':
      return i18n('ticket.create.error_data', '格式不符')
    default:
      return ''
  }
}
