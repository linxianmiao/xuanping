function configList(configList) {
  let list = configList
  list =
    _.reduce(
      list,
      (curr, pre) => {
        if (pre.code !== 'layoutInfoVo' && pre.code !== 'userAndGroupList') {
          if (pre.code === 'code') {
            pre = {
              ...pre,
              name: '字段编码'
            }
          }
          curr.push(pre)
        }
        return curr
      },
      []
    ) || []

  const isRequiredConfig = [
    {
      name: i18n('conf.model.basic.check', '基础校验'),
      required: 1,
      code: 'isRequired',
      type: 'radio',
      defaultValue: 0,
      options: [
        {
          value: 0,
          label: i18n('conf.model.field.optional', '选填')
        },
        {
          value: 1,
          label: i18n('conf.model.field.required', '必填')
        },
        {
          value: 2,
          label: i18n('conf.model.field.read-only', '只读')
        }
      ]
    },
    {
      name: i18n('is-show-column', '是否是展示列'),
      required: 1,
      code: 'isShowColumn',
      type: 'radio',
      defaultValue: 0,
      options: [
        {
          value: 1,
          label: i18n('yes', '是')
        },
        {
          value: 0,
          label: i18n('no', '否')
        }
      ]
    }
  ]
  list = list.concat(isRequiredConfig)

  return list
}
export default configList
