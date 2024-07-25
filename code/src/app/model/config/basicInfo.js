import limitFields from '../../../assets/limitFields'

const BasicInfoConfig = [
  {
    name: i18n('conf.model.modelName', '模型名称'),
    required: 1,
    code: 'name',
    type: 'input',
    minLength: 0,
    maxLength: 32
  },
  {
    name: i18n('conf.model.modelCode', '模型编码'),
    required: 1,
    code: 'modelCode',
    type: 'modelCode',
    minLength: 6,
    maxLength: 20
  },
  {
    name: i18n('conf.model.ruleBegin', '单号规则'),
    required: 1,
    code: 'parallel',
    type: 'parallel',
    children: [
      {
        required: 1,
        code: 'ruleBegin',
        name: i18n('conf.model.ruleBegin', '单号规则'),
        type: 'input',
        minLength: 2,
        maxLength: 8
      },
      {
        required: 1,
        code: 'ruleTime',
        name: i18n('conf.model.ruleTime', '日期'),
        type: 'select',
        defaultValue: '1',
        params: [
          { key: '0', label: i18n('conf.model.urleTime0', '无日期') },
          { key: '1', label: i18n('conf.model.ruleTime1', '短日期') },
          { key: '2', label: i18n('conf.model.ruleTime2', '长日期') }
        ]
      },
      {
        required: 1,
        code: 'ruleLength',
        type: 'select',
        name: i18n('conf.model.ruleLength', '流水号'),
        defaultValue: '4',
        params: [
          { key: '4', label: i18n('conf.model.ruleLength4', '四位流水号') },
          { key: '5', label: i18n('conf.model.ruleLength5', '五位流水号') },
          { key: '8', label: i18n('conf.model.ruleLength8', '八位流水号') }
        ]
      },
      {
        required: 1,
        code: 'ruleRestMode',
        type: 'select',
        name: i18n('number.reset.mode', '流水号重置模式'),
        params: [
          { key: '9', label: i18n('reset.by.day', '按日重置') },
          { key: '11', label: i18n('reset.by.year', '按年重置') }
        ]
      }
    ]
  },
  {
    name: i18n('conf.model.iconName', '模型图标'),
    required: 2,
    code: 'iconName',
    type: 'iconName',
    iconName: 'alter',
    fileId: ''
  },
  {
    name: i18n('conf.model.managerList', '管理员'),
    required: 2,
    code: 'modelManager',
    type: 'modelManager'
  },
  {
    name: i18n('shared.tenant', '共享租户'),
    required: 2,
    code: 'sharedTenantVo',
    type: 'shareTenant'
  },
  {
    name: i18n('process.manager', '流程经理'),
    required: 2,
    code: 'modelUseManager',
    type: 'modelUseManager'
  },
  {
    name: i18n('conf.model.usersAndGroup', '授权用户'),
    required: 2,
    code: 'usersAndGroup',
    type: 'usersAndGroup'
  },
  {
    name: i18n('conf.model.modelType', '模型类型'),
    required: 1,
    code: 'modelTypeVo',
    type: 'modelType'
  },
  {
    name: i18n('conf.model.field.layoutId', '分组'),
    required: 1,
    code: 'layoutVos',
    type: 'layout'
  },
  {
    name: i18n('conf.model.field.stageScope', '阶段范围'),
    required: 0,
    code: 'modelStageScopeVo',
    type: 'modelStage'
  },
  // {
  //   name: i18n('in.which.app', '所属应用'),
  //   required: 1,
  //   code: 'appCode',
  //   type: 'appCode'
  // },
  {
    name: i18n('conf.model.description', '模型说明'),
    required: 2,
    code: 'description',
    type: 'textarea',
    minLength: 0,
    maxLength: limitFields.config.description
  }
]

export default BasicInfoConfig
