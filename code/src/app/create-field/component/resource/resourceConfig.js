import CommonConfig from '../../config/commonConfig'

const Config = [
  {
    name: i18n('field_value_assetArrage', '资源范围'),
    required: 1,
    code: 'formType',
    type: 'radio',
    defaultValue: 'ALL',
    options: [
      {
        value: 'ALL',
        label: i18n('field_value_All', '所有')
      },
      {
        value: 'CMDB',
        label: i18n('field_value_pz', '配置')
      },
      {
        value: 'ASSET',
        label: i18n('field_value_asset', '资产')
      }
    ]
  },
  {
    name: i18n('field_value_assetsType', '使用类型'),
    required: 1,
    code: 'isSingle',
    type: 'radio',
    defaultValue: '0',
    options: [
      {
        value: '0',
        label: i18n('field_value_listSel', '下拉选择')
      },
      {
        value: '1',
        label: i18n('field_value_list', '列表')
      }
    ]
  },
  {
    name: i18n('field_value_user_isSingle', '选择类型'),
    required: 1,
    code: 'multiple',
    type: 'radio',
    defaultValue: '0',
    options: [
      {
        value: '0',
        label: i18n('create.field.cascader.cascader', '单选')
      },
      {
        value: '1',
        label: i18n('create.field.cascader.treeSel', '多选')
      }
    ]
  },
  {
    name: i18n('field_value_zyType', '资源类型'),
    code: 'resType',
    type: 'resource',
    defaultValue: undefined
  },
  {
    name: i18n('data_permission_config', '数据权限控制'),
    code: 'checkEditPermission',
    type: 'checkbox',
    defaultValue: false,
    label: i18n('enable_cmdb_permision', '启用cmdb资源组编辑权限')
  },
  {
    name: i18n('field_value_resource', '使用场景'),
    required: 1,
    code: 'useScene',
    type: 'useScene',
    defaultValue: {
      relation: { type: false, value: i18n('field_value_resource_tip0', '关联') },
      increased: { type: false, value: i18n('field_value_assets_tip1', '新增') },
      edit: { type: false, value: i18n('field_value_assets_tip2', '编辑') },
      batchEdit: { type: false, value: i18n('field_value_assets_tip3', '批量编辑') },
      planDelete: { type: false, value: i18n('button.delete', '删除') },
      importOrExport: { type: false, value: i18n('ticket.create.importOrExport', '导入导出') }
    },
    params: [
      {
        value: 'relation',
        disabled: false,
        label: i18n('field_value_resource_tip0', '关联')
      },
      {
        value: 'increased',
        label: i18n('field_value_assets_tip1', '新增'),
        disabled: false
      },
      {
        value: 'edit',
        label: i18n('field_value_assets_tip2', '编辑'),
        disabled: false
      },
      {
        value: 'batchEdit',
        label: i18n('field_value_assets_tip3', '批量编辑'),
        disabled: false
      },
      {
        value: 'planDelete',
        label: i18n('button.delete', '删除'),
        disabled: false
      },
      {
        value: 'importOrExport',
        label: i18n('ticket.create.importOrExport', '导入导出'),
        disabled: false
      }
    ]
  },
  {
    name: i18n('field_value_assets_attrFliter', '属性过滤'),
    code: 'attributeValues',
    type: 'attributeValues',
    defaultValue: undefined
  }
]

export default [...CommonConfig, ...Config]
