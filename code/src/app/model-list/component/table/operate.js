import React from 'react'
import { Link } from 'react-router-dom'
import { Modal, Button } from '@uyun/components'
import { orLowcode } from '~/utils/common'

const ButtonGroup = Button.Group
const confirm = Modal.confirm
function Operate(props) {
  const {
    modelDelete,
    modelInsert,
    modelModify,
    modelExport,
    record,
    moveRow,
    changeStatus,
    showStatusButton
  } = props
  const { id, mode, modelStatus, useable } = record
  const applyType = modelStatus === 1 ? 2 : 1
  function showConfirm() {
    if (useable === 1) return
    confirm({
      title: '确定要删除当前模型么?',
      content: '模型删除无法恢复',
      onOk() {
        changeStatus(record, 4)
      },
      onCancel() {}
    })
  }
  return (
    <ButtonGroup type="link">
      {
        // modelStatus : 开发中：-1，待审核：0，已发布：1
        // 开发中，可启用，可删除
        // 待审核，不可启用不可停用，可删除
        // 已发布，可停用，不可删除
        // modelStatus : 开发中：-1，待审核：0，已发布：1
        // applyType: 动作类型，启用：1，停用：2，发布：3，删除：4
        !showStatusButton && !window.LOWCODE_APP_KEY && (
          <a disabled={modelStatus === 0} onClick={() => changeStatus(record, applyType)}>
            {modelStatus === 1 ? i18n('disable', '停用') : i18n('Enable', '启用')}
          </a>
        )
      }
      {
        // 移动权限等于修改权限
        orLowcode(modelModify) && <a onClick={() => moveRow(record)}>{i18n('move_to', '移动到')}</a>
      }
      {
        // 敏捷模型可以复制，复制权限等同于模型得新增权限
        mode === 0 && modelInsert && (
          <Link to={`/conf/model/copy/${id}`}>{i18n('copy', '复制')}</Link>
        )
      }
      {
        // 高级模型可以导出
        mode === 1 && orLowcode(modelExport) && (
          <a
            onClick={() => {
              let url = `${API.exportAdvancedModel}?modelId=${id}`
              if (window.LOWCODE_APP_KEY) {
                url += `&appkey=${window.LOWCODE_APP_KEY}`
              }
              window.open(url)
            }}
          >
            {i18n('export', '导出')}
          </a>
        )
      }
      {
        // 拥有模型得删除权限且模型停用的时候可以删除
        orLowcode(modelDelete) && (
          <a disabled={useable === 1} onClick={() => showConfirm()}>
            {i18n('delete', '删除')}
          </a>
        )
      }
    </ButtonGroup>
  )
}

export default Operate
